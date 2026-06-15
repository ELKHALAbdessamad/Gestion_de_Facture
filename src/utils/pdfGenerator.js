import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { getActiveEntreprise } from './currency';

// ─── Génère le QR code de la facture ─────────────────────────────────────────
const generateQRDataUrl = async (facture, client, devise = 'MAD') => {
  const qrContent = [
    `Facture: ${facture.numero}`,
    `Client: ${client?.nom || ''}`,
    `Date: ${new Date(facture.date_creation).toLocaleDateString('fr-FR')}`,
    `Total TTC: ${(facture.total_ttc || 0).toFixed(2)} ${devise}`,
    `Statut: ${facture.statut}`,
    facture.validated_by_admin ? `Validé par: ${facture.validated_by}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return QRCode.toDataURL(qrContent, {
    width: 80,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' },
  });
};

// ─── Générateur principal (async pour QR) ────────────────────────────────────
export const generateFacturePDF = async (
  facture,
  client,
  articles,
  parametres,
  signatureDataUrl = null   // base64 PNG de la signature dessinée
) => {
  const doc = new jsPDF();

  if (!facture || !client) {
    console.error('Facture ou client manquant');
    return doc;
  }

  const entreprise = getActiveEntreprise(parametres);
  const devise = parametres?.devise || 'MAD';
  const fmt = (n) => `${(n || 0).toFixed(2)} ${devise}`;

  // Palette
  const gold   = [212, 168, 83];
  const dark   = [8,   8,   7];
  const gray   = [200, 200, 200];

  // ── Bordure dorée supérieure ──────────────────────────────────────────────
  doc.setDrawColor(...gold);
  doc.setLineWidth(3);
  doc.line(10, 10, 200, 10);

  // ── En-tête entreprise (gauche) ───────────────────────────────────────────
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...gold);
  doc.text(entreprise.nom || 'Facture.net', 15, 25);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(entreprise.adresse || '123 Business Street', 15, 32);
  doc.text(
    `${entreprise.code_postal || '75001'} ${entreprise.ville || 'Casablanca'}`,
    15, 37
  );
  doc.text(`Tél: ${entreprise.tel || '+212 5 22 00 00 00'}`, 15, 42);
  doc.text(`Email: ${entreprise.email || 'contact@facture.net'}`, 15, 47);
  doc.text(`SIRET/RC: ${entreprise.siret || 'RC 123456'}`, 15, 52);

  // ── Bloc client (droite) ──────────────────────────────────────────────────
  doc.setDrawColor(...gray);
  doc.setLineWidth(0.5);
  doc.rect(120, 20, 75, 35);

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...dark);
  doc.text('FACTURÉ À :', 125, 27);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(client.nom, 125, 34);
  if (client.adresse) doc.text(client.adresse, 125, 39);
  if (client.tel)     doc.text(`Tél: ${client.tel}`, 125, 44);
  if (client.email)   doc.text(client.email, 125, 49);

  // ── Titre + infos facture ─────────────────────────────────────────────────
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...gold);
  doc.text('FACTURE', 15, 70);

  doc.setFillColor(245, 245, 245);
  doc.rect(15, 75, 180, 20, 'F');

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...dark);
  doc.text(`N° ${facture.numero}`, 20, 83);

  doc.setFont(undefined, 'normal');
  doc.text(`Date : ${new Date(facture.date_creation).toLocaleDateString('fr-FR')}`, 20, 90);

  if (facture.date_echeance) {
    doc.text(`Échéance : ${new Date(facture.date_echeance).toLocaleDateString('fr-FR')}`, 90, 90);
  }

  const statutColor =
    facture.statut === 'Payée'     ? [74, 222, 128] :
    facture.statut === 'En attente'? [251, 191, 36]  :
    facture.statut === 'Rejetée'   ? [239, 68,  68]  : [150, 150, 150];

  doc.setTextColor(...statutColor);
  doc.setFont(undefined, 'bold');
  doc.text(`Statut : ${facture.statut}`, 155, 83);

  // Badge validation
  if (facture.validated_by_admin) {
    doc.setFontSize(8);
    doc.setTextColor(74, 222, 128);
    doc.text(`✓ Validé par ${facture.validated_by || 'admin'}`, 155, 90);
  }

  // ── Tableau des articles ──────────────────────────────────────────────────
  const tableData = (facture.articles || []).map(item => {
    const qty  = parseFloat(item.quantite)    || 0;
    const pu   = parseFloat(item.prix_unitaire)|| 0;
    const rem  = parseFloat(item.remise)       || 0;
    const st   = qty * pu;
    const tot  = st * (1 - rem / 100);
    return [
      item.designation || item.description || '-',
      qty.toString(),
      `${pu.toFixed(2)} ${devise}`,
      rem > 0 ? `${rem}%` : '-',
      `${(item.tva || 20)}%`,
      `${tot.toFixed(2)} ${devise}`,
    ];
  });

  autoTable(doc, {
    startY: 100,
    head: [['Désignation', 'Qté', 'Prix Unit.', 'Remise', 'TVA', 'Total HT']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: gold,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 3,
    },
    bodyStyles: { fontSize: 8, textColor: [40, 40, 40], cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 65, halign: 'left' },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 28, halign: 'right' },
    },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 15, right: 15 },
  });

  // ── Totaux ────────────────────────────────────────────────────────────────
  let y = (doc.previousAutoTable?.finalY || 140) + 8;

  const totalsHeight = facture.remise_globale > 0 ? 48 : 32;
  doc.setFillColor(245, 245, 245);
  doc.rect(110, y, 85, totalsHeight, 'F');

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(60, 60, 60);

  doc.text('Total HT :', 115, y + 8);
  doc.text(fmt(facture.total_ht), 192, y + 8, { align: 'right' });

  if (facture.remise_globale > 0) {
    doc.setTextColor(239, 68, 68);
    doc.text(`Remise globale (${facture.remise_globale}%) :`, 115, y + 16);
    doc.text(`-${fmt(facture.remise_montant)}`, 192, y + 16, { align: 'right' });

    doc.setTextColor(60, 60, 60);
    doc.text('Après remise :', 115, y + 24);
    doc.text(fmt(facture.total_apres_remise), 192, y + 24, { align: 'right' });
  }

  const tvay = facture.remise_globale > 0 ? y + 32 : y + 16;
  doc.setTextColor(60, 60, 60);
  doc.text('TVA :', 115, tvay);
  doc.text(fmt(facture.tva), 192, tvay, { align: 'right' });

  const ttcy = tvay + 9;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...gold);
  doc.text('Total TTC :', 115, ttcy);
  doc.text(fmt(facture.total_ttc), 192, ttcy, { align: 'right' });

  // ── Infos paiement ────────────────────────────────────────────────────────
  y = y + totalsHeight + 10;

  if (facture.mode_paiement || facture.type_virement || facture.date_depot || facture.date_encaissement) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...dark);
    doc.text('Informations de paiement :', 15, y);

    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    let py = y + 6;
    if (facture.mode_paiement)     { doc.text(`Mode : ${facture.mode_paiement}`, 15, py); py += 5; }
    if (facture.type_virement)     { doc.text(`Type virement : ${facture.type_virement}`, 15, py); py += 5; }
    if (facture.date_depot)        { doc.text(`Date dépôt : ${new Date(facture.date_depot).toLocaleDateString('fr-FR')}`, 15, py); py += 5; }
    if (facture.date_encaissement) { doc.text(`Date encaissement : ${new Date(facture.date_encaissement).toLocaleDateString('fr-FR')}`, 15, py); py += 5; }
    y = py + 4;
  }

  // ── Conditions ────────────────────────────────────────────────────────────
  if (y < 240) {
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...dark);
    doc.text('Conditions de paiement :', 15, y);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text("Paiement à réception · Pénalités de retard : 3× le taux légal · Indemnité forfaitaire : 40 MAD", 15, y + 5);
    y += 14;
  }

  // ── Signature (si fournie) ────────────────────────────────────────────────
  if (signatureDataUrl && y < 250) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...dark);
    doc.text('Signature :', 15, y);
    doc.addImage(signatureDataUrl, 'PNG', 15, y + 3, 60, 20);

    // Ligne sous signature
    doc.setDrawColor(...gray);
    doc.setLineWidth(0.3);
    doc.line(15, y + 25, 75, y + 25);
    doc.setFontSize(7);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('Signature numérique', 15, y + 30);
    y += 35;
  }

  // ── QR Code (coin bas droit) ──────────────────────────────────────────────
  let qrDataUrl = null;
  try {
    qrDataUrl = await generateQRDataUrl(facture, client, devise);
  } catch (_) {}

  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', 165, 245, 28, 28);
    doc.setFontSize(6);
    doc.setTextColor(120, 120, 120);
    doc.text('Scanner pour vérifier', 166, 275);
  }

  // ── Pied de page ─────────────────────────────────────────────────────────
  doc.setDrawColor(...gold);
  doc.setLineWidth(1);
  doc.line(15, 278, 195, 278);

  doc.setFontSize(7);
  doc.setFont(undefined, 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text('Merci de votre confiance', 105, 284, { align: 'center' });
  doc.text(
    `${entreprise.nom || 'Facture.net'} — ${entreprise.email || 'contact@facture.net'}`,
    105, 289, { align: 'center' }
  );

  return doc;
};

// ─── Téléchargement ───────────────────────────────────────────────────────────
export const downloadFacturePDF = async (facture, client, articles, parametres, signatureDataUrl = null) => {
  const doc = await generateFacturePDF(facture, client, articles, parametres, signatureDataUrl);
  doc.save(`Facture_${facture.numero}.pdf`);
};
