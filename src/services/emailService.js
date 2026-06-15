// ─── Service d'envoi d'emails ──────────────────────────────────────────────
// Deux modes :
//   1. EmailJS (envoi SMTP réel sans backend) — si REACT_APP_EMAILJS_* configuré
//   2. mailto: (fallback, ouvre le client mail de l'utilisateur)

import emailjs from '@emailjs/browser';

// ── Config EmailJS (à renseigner dans .env) ──────────────────────────────────
// REACT_APP_EMAILJS_SERVICE_ID=service_xxxxxxx
// REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxxxx
// REACT_APP_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
//
// Obtenir ces clés sur https://www.emailjs.com (plan gratuit = 200 emails/mois)

const EMAILJS_SERVICE_ID  = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

const emailjsConfigured = EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY;

// ── Construction du corps de l'email ─────────────────────────────────────────
export const buildEmailParams = (facture, client, parametres) => {
  const ent    = parametres?.entreprise || {};
  const devise = parametres?.devise || 'MAD';

  const articlesText = (facture.articles || [])
    .map(a => `  - ${a.designation} × ${a.quantite} = ${((a.quantite || 0) * (a.prix_unitaire || 0) * (1 - (a.remise || 0) / 100)).toFixed(2)} ${devise}`)
    .join('\n');

  return {
    // Destinataire
    to_email  : client.email,
    to_name   : client.nom,

    // Expéditeur
    from_name : ent.nom  || 'Facture.net',
    from_email: ent.email || 'contact@facture.net',
    reply_to  : ent.email || 'contact@facture.net',

    // Contenu facture
    invoice_number : facture.numero,
    invoice_date   : new Date(facture.date_creation).toLocaleDateString('fr-FR'),
    invoice_due    : facture.date_echeance
                       ? new Date(facture.date_echeance).toLocaleDateString('fr-FR')
                       : '—',
    invoice_status : facture.statut,
    invoice_total  : `${(facture.total_ttc || 0).toFixed(2)} ${devise}`,
    invoice_articles: articlesText,

    // Infos entreprise
    company_name   : ent.nom    || 'Facture.net',
    company_email  : ent.email  || '',
    company_tel    : ent.tel    || '',
    company_address: `${ent.adresse || ''} ${ent.code_postal || ''} ${ent.ville || ''}`.trim(),
    company_siret  : ent.siret  || '',

    // Message
    message: `Bonjour ${client.nom},\n\nVeuillez trouver ci-dessous les détails de votre facture ${facture.numero} validée par notre service.\n\nMontant total TTC : ${(facture.total_ttc || 0).toFixed(2)} ${devise}\n\nNous restons à votre disposition pour toute question.\n\nCordialement,\n${ent.nom || 'Facture.net'}`,
  };
};

// ── Envoi via EmailJS (réel) ──────────────────────────────────────────────────
export const sendFactureByEmailJS = async (facture, client, parametres) => {
  if (!client?.email) throw new Error("Ce client n'a pas d'adresse email");
  if (!emailjsConfigured) throw new Error('EmailJS non configuré — utilisation de mailto:');

  const params = buildEmailParams(facture, client, parametres);
  const result = await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    params,
    EMAILJS_PUBLIC_KEY
  );

  if (result.status !== 200) throw new Error(`Erreur EmailJS : ${result.text}`);
  return true;
};

// ── Fallback mailto: (ouvre le client mail) ───────────────────────────────────
export const sendByMailto = (facture, client, parametres) => {
  if (!client?.email) throw new Error("Ce client n'a pas d'adresse email");

  const ent    = parametres?.entreprise || {};
  const devise = parametres?.devise || 'MAD';

  const subject = encodeURIComponent(
    `Facture ${facture.numero} — ${ent.nom || 'Facture.net'}`
  );
  const body = encodeURIComponent(
    `Bonjour ${client.nom},\n\n` +
    `Votre facture ${facture.numero} a été validée.\n\n` +
    `Montant TTC : ${(facture.total_ttc || 0).toFixed(2)} ${devise}\n` +
    `Date : ${new Date(facture.date_creation).toLocaleDateString('fr-FR')}\n` +
    (facture.date_echeance
      ? `Échéance : ${new Date(facture.date_echeance).toLocaleDateString('fr-FR')}\n`
      : '') +
    `\nCordialement,\n${ent.nom || 'Facture.net'} — ${ent.email || ''}`
  );

  window.open(`mailto:${encodeURIComponent(client.email)}?subject=${subject}&body=${body}`, '_blank');
  return true;
};

// ── Point d'entrée principal : essaie EmailJS, sinon mailto ───────────────────
export const sendFactureByEmail = async (facture, client, parametres) => {
  if (!client?.email) throw new Error("Ce client n'a pas d'adresse email");

  if (emailjsConfigured) {
    return sendFactureByEmailJS(facture, client, parametres);
  } else {
    return sendByMailto(facture, client, parametres);
  }
};
