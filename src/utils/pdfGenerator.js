import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { getActiveEntreprise } from './currency';
import { translationsComplete } from '../i18n/translations';
import { loadLogoBase64 } from './logoLoader';

// Fonction pour obtenir les traductions PDF
const getPDFTranslations = (language = 'fr') => {
  const t = translationsComplete[language] || translationsComplete.fr;
  return {
    invoice: language === 'fr' ? 'FACTURE' : 'INVOICE',
    billedTo: language === 'fr' ? 'FACTURÉ À :' : 'BILLED TO:',
    invoiceNumber: language === 'fr' ? 'N°' : 'No.',
    date: language === 'fr' ? 'Date :' : 'Date:',
    dueDate: language === 'fr' ? 'Échéance :' : 'Due Date:',
    status: language === 'fr' ? 'Statut :' : 'Status:',
    validatedBy: language === 'fr' ? 'Validé par' : 'Validated by',
    
    // Tableau
    designation: language === 'fr' ? 'Désignation' : 'Description',
    quantity: language === 'fr' ? 'Qté' : 'Qty',
    unitPrice: language === 'fr' ? 'Prix Unit.' : 'Unit Price',
    discount: language === 'fr' ? 'Remise' : 'Discount',
    vat: 'TVA',
    totalHT: language === 'fr' ? 'Total HT' : 'Total',
    
    // Totaux
    subtotal: language === 'fr' ? 'Total HT :' : 'Subtotal:',
    globalDiscount: language === 'fr' ? 'Remise globale' : 'Global Discount',
    afterDiscount: language === 'fr' ? 'Après remise :' : 'After Discount:',
    vatTotal: 'TVA :',
    totalTTC: language === 'fr' ? 'Total TTC :' : 'Total:',
    
    // Infos paiement
    paymentInfo: language === 'fr' ? 'Informations de paiement' : 'Payment Information',
    paymentMethod: language === 'fr' ? 'Mode :' : 'Method:',
    transferType: language === 'fr' ? 'Type virement :' : 'Transfer Type:',
    depositDate: language === 'fr' ? 'Dépôt :' : 'Deposit:',
    collectionDate: language === 'fr' ? 'Encaissement :' : 'Collection:',
    
    // Signature
    signature: language === 'fr' ? 'Signature' : 'Signature',
    digitalSignature: language === 'fr' ? 'Signature numérique' : 'Digital signature',
    
    // Conditions
    paymentTerms: language === 'fr' ? 'Conditions de paiement' : 'Payment Terms',
    termsText: language === 'fr' 
      ? "Paiement à réception · Pénalités de retard : 3× le taux légal · Indemnité forfaitaire : 40 MAD"
      : "Payment due on receipt · Late payment penalty: 3× legal rate · Fixed compensation: 40 MAD",
    
    // QR & Footer
    scanToDownload: language === 'fr' ? 'Scanner pour télécharger' : 'Scan to download',
    thankYou: language === 'fr' ? 'Merci de votre confiance' : 'Thank you for your business',
    
    // Statuts
    statusPaid: language === 'fr' ? 'Payée' : 'Paid',
    statusPending: language === 'fr' ? 'En attente' : 'Pending',
    statusRejected: language === 'fr' ? 'Rejetée' : 'Rejected',
  };
};

// ─── Génère le QR code pour téléchargement mobile ─────────────────────────────
const generateQRDataUrl = async (facture, parametres) => {
  // Utiliser REACT_APP_PUBLIC_URL (Railway) pour les QR codes publics
  // Le QR code pointe maintenant vers /api/factures/pdf/:id pour téléchargement direct
  const baseUrl = process.env.REACT_APP_PUBLIC_URL || parametres?.url_publique || window.location.origin || 'http://localhost:3000';
  const downloadUrl = `${baseUrl}/api/factures/pdf/${facture.id}`;

  return QRCode.toDataURL(downloadUrl, {
    width: 100,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000', light: '#ffffff' },
  });
};

// ─── Générateur principal (async pour QR) ────────────────────────────────────
export const generateFacturePDF = async (
  facture,
  client,
  articles,
  parametres,
  signatureDataUrl = null,  // base64 PNG de la signature dessinée
  language = 'fr'            // Langue pour les traductions
) => {
  const doc = new jsPDF();
  const tr = getPDFTranslations(language);

  if (!facture) {
    console.error('Facture manquante');
    return doc;
  }

  const entreprise = getActiveEntreprise(parametres);
  const devise = parametres?.devise || 'MAD';
  const fmt = (n) => `${(n || 0).toFixed(2)} ${devise}`;

  // Palette
  const gold   = [212, 168, 83];
  const dark   = [8,   8,   7];
  const gray   = [200, 200, 200];

  // Charger le logo NovaFact
  const logoBase64 = await loadLogoBase64();

  // ── Bordure dorée supérieure ──────────────────────────────────────────────
  doc.setDrawColor(...gold);
  doc.setLineWidth(3);
  doc.line(10, 10, 200, 10);

  // ── Logo NovaFact (haut gauche, petit) — fond blanc pour masquer background noir ──
  if (logoBase64) {
    // Fond blanc derrière le logo pour effacer le fond noir de l'image
    doc.setFillColor(255, 255, 255);
    doc.rect(12, 13, 22, 22, 'F');
    doc.addImage(logoBase64, 'PNG', 12, 13, 22, 22);
  }

  // ── Nom entreprise à côté du logo ────────────────────────────────────────
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...gold);
  doc.text(entreprise.nom || 'NovaFact', 38, 22);

  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(80, 80, 80);
  const infoLines = [
    entreprise.adresse,
    `${entreprise.code_postal || ''} ${entreprise.ville || ''}`.trim(),
    entreprise.tel ? `Tél: ${entreprise.tel}` : null,
    entreprise.email ? `Email: ${entreprise.email}` : null,
    entreprise.siret ? `RC: ${entreprise.siret}` : null,
  ].filter(Boolean);
  infoLines.forEach((line, i) => doc.text(line, 38, 28 + i * 4.5));

  // ── Bloc client (droite, bien séparé) ─────────────────────────────────────
  doc.setDrawColor(...gray);
  doc.setLineWidth(0.5);
  doc.rect(130, 13, 68, 35);

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...dark);
  doc.text(tr.billedTo, 134, 21);

  doc.setFontSize(8.5);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(60, 60, 60);
  let clientY = 28;
  if (client) {
    doc.text(client.nom || '', 134, clientY); clientY += 5;
    if (client.adresse) { doc.text(client.adresse, 134, clientY); clientY += 5; }
    if (client.tel)     { doc.text(`Tél: ${client.tel}`, 134, clientY); clientY += 5; }
    if (client.email)   { doc.text(client.email, 134, clientY); }
  }

  // ── Titre + infos facture ─────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...gold);
  doc.text(tr.invoice, 15, 58);

  doc.setFillColor(245, 245, 245);
  doc.rect(15, 62, 180, 18, 'F');

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...dark);
  doc.text(`${tr.invoiceNumber} ${facture.numero}`, 20, 70);

  doc.setFont(undefined, 'normal');
  const dateFormat = language === 'fr' ? 'fr-FR' : 'en-US';
  doc.text(`${tr.date} ${new Date(facture.date_creation).toLocaleDateString(dateFormat)}`, 20, 77);

  if (facture.date_echeance) {
    doc.text(`${tr.dueDate} ${new Date(facture.date_echeance).toLocaleDateString(dateFormat)}`, 90, 77);
  }

  const statutColor =
    facture.statut === 'Payée'     ? [34, 197, 94]  :
    facture.statut === 'En attente'? [251, 191, 36]  :
    facture.statut === 'Rejetée'   ? [239, 68,  68]  : [150, 150, 150];

  const statutText = 
    facture.statut === 'Payée' ? tr.statusPaid :
    facture.statut === 'En attente' ? tr.statusPending :
    facture.statut === 'Rejetée' ? tr.statusRejected : facture.statut;

  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text(`${tr.status} ${statutText}`, 155, 70);


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
    startY: 84,
    head: [[tr.designation, tr.quantity, tr.unitPrice, tr.discount, tr.vat, tr.totalHT]],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: gold,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 2,
    },
    bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40], cellPadding: 2 },
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

  // ── Totaux (plus compacts) ───────────────────────────────────────────────
  let y = (doc.previousAutoTable?.finalY || 140) + 6;

  const totalsHeight = facture.remise_globale > 0 ? 40 : 28;
  doc.setFillColor(245, 245, 245);
  doc.rect(110, y, 85, totalsHeight, 'F');

  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(60, 60, 60);

  doc.text(tr.subtotal, 115, y + 6);
  doc.text(fmt(facture.total_ht), 192, y + 6, { align: 'right' });

  if (facture.remise_globale > 0) {
    doc.setTextColor(239, 68, 68);
    doc.text(`${tr.globalDiscount} (${facture.remise_globale}%) :`, 115, y + 12);
    doc.text(`-${fmt(facture.remise_montant)}`, 192, y + 12, { align: 'right' });

    doc.setTextColor(60, 60, 60);
    doc.text(tr.afterDiscount, 115, y + 18);
    doc.text(fmt(facture.total_apres_remise), 192, y + 18, { align: 'right' });
  }

  const tvay = facture.remise_globale > 0 ? y + 24 : y + 12;
  doc.setTextColor(60, 60, 60);
  doc.text(tr.vatTotal, 115, tvay);
  doc.text(fmt(facture.tva), 192, tvay, { align: 'right' });

  const ttcy = tvay + 7;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...gold);
  doc.text(tr.totalTTC, 115, ttcy);
  doc.text(fmt(facture.total_ttc), 192, ttcy, { align: 'right' });

  // ── Section inférieure en 2 colonnes (gauche: infos paiement + signature, droite: conditions + QR) ──
  y = y + totalsHeight + 8;

  // COLONNE GAUCHE : Infos paiement + Signature
  let leftY = y;
  
  if (facture.mode_paiement || facture.type_virement || facture.date_depot || facture.date_encaissement) {
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...dark);
    doc.text(tr.paymentInfo, 15, leftY);

    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    leftY += 4;
    if (facture.mode_paiement)     { doc.text(`${tr.paymentMethod} ${facture.mode_paiement}`, 15, leftY); leftY += 4; }
    if (facture.type_virement)     { doc.text(`${tr.transferType} ${facture.type_virement}`, 15, leftY); leftY += 4; }
    if (facture.date_depot)        { doc.text(`${tr.depositDate} ${new Date(facture.date_depot).toLocaleDateString(dateFormat)}`, 15, leftY); leftY += 4; }
    if (facture.date_encaissement) { doc.text(`${tr.collectionDate} ${new Date(facture.date_encaissement).toLocaleDateString(dateFormat)}`, 15, leftY); leftY += 4; }
    leftY += 3;
  }

  // Signature (compacte)
  if (signatureDataUrl) {
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...dark);
    doc.text(tr.signature, 15, leftY);
    doc.addImage(signatureDataUrl, 'PNG', 15, leftY + 2, 50, 16);

    doc.setDrawColor(...gray);
    doc.setLineWidth(0.2);
    doc.line(15, leftY + 19, 65, leftY + 19);
    doc.setFontSize(6);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text(tr.digitalSignature, 15, leftY + 23);
  }

  // COLONNE DROITE : Conditions
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...dark);
  doc.text(tr.paymentTerms, 110, y);
  doc.setFontSize(6.5);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(80, 80, 80);
  
  const splitConditions = doc.splitTextToSize(tr.termsText, 85);
  doc.text(splitConditions, 110, y + 4);

  // ── QR Code pour téléchargement mobile ────────────────────────────────────
  let qrDataUrl = null;
  try {
    qrDataUrl = await generateQRDataUrl(facture, parametres);
  } catch (err) {
    console.error('Erreur génération QR:', err);
  }

  if (qrDataUrl) {
    const qrSize = 25;
    const qrX = 168;
    const qrY = y + 10;
    
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    doc.setFontSize(5.5);
    doc.setTextColor(120, 120, 120);
    doc.text(tr.scanToDownload, qrX + 1, qrY + qrSize + 3);
  }

  // ── Pied de page (plus compact) ──────────────────────────────────────────
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.8);
  doc.line(15, 270, 195, 270);

  doc.setFontSize(6.5);
  doc.setFont(undefined, 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(tr.thankYou, 105, 275, { align: 'center' });

  return doc;
};

// ─── Téléchargement ───────────────────────────────────────────────────────────
export const downloadFacturePDF = async (facture, client, articles, parametres, signatureDataUrl = null, language = 'fr') => {
  const doc = await generateFacturePDF(facture, client, articles, parametres, signatureDataUrl, language);
  doc.save(`${language === 'fr' ? 'Facture' : 'Invoice'}_${facture.numero}.pdf`);
};
