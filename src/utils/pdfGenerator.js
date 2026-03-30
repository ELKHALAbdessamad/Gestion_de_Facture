import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateFacturePDF = (facture, client, articles, parametres) => {
  const doc = new jsPDF();
  
  // Vérification des données
  if (!facture || !client) {
    console.error('Facture ou client manquant');
    return doc;
  }
  
  // En-tête entreprise
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text(parametres?.entreprise?.nom || 'Facture.net', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(parametres?.entreprise?.adresse || '123 Business Street', 20, 28);
  doc.text(`${parametres?.entreprise?.code_postal || '75001'} ${parametres?.entreprise?.ville || 'Paris'}`, 20, 33);
  doc.text(`Tél: ${parametres?.entreprise?.tel || '+33 1 23 45 67 89'}`, 20, 38);
  doc.text(`Email: ${parametres?.entreprise?.email || 'contact@facture.net'}`, 20, 43);
  doc.text(`SIRET: ${parametres?.entreprise?.siret || '123 456 789 00012'}`, 20, 48);
  
  // Informations client
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Client:', 120, 20);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(client.nom, 120, 28);
  doc.text(client.adresse || '', 120, 33);
  doc.text(`Tél: ${client.tel || ''}`, 120, 38);
  doc.text(`Email: ${client.email || ''}`, 120, 43);
  
  // Informations facture
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(`FACTURE N° ${facture.numero}`, 20, 65);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Date: ${new Date(facture.date_creation).toLocaleDateString('fr-FR')}`, 20, 72);
  doc.text(`Statut: ${facture.statut}`, 20, 77);
  
  // Tableau des articles
  const tableData = (facture.articles || []).map(item => {
    const article = articles.find(a => a.id === item.article_id);
    return [
      item.designation || article?.designation || 'Article inconnu',
      item.quantite || 0,
      `${(item.prix_unitaire || 0).toFixed(2)} €`,
      `${item.tva || 20}%`,
      `${((item.quantite || 0) * (item.prix_unitaire || 0)).toFixed(2)} €`
    ];
  });
  
  autoTable(doc, {
    startY: 85,
    head: [['Désignation', 'Qté', 'Prix Unit.', 'TVA', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 9 }
  });
  
  // Totaux
  const finalY = (doc.previousAutoTable?.finalY || 85) + 10;
  
  doc.setFontSize(10);
  doc.text(`Total HT: ${(facture.total_ht || 0).toFixed(2)} €`, 140, finalY);
  doc.text(`TVA: ${(facture.tva || 0).toFixed(2)} €`, 140, finalY + 7);
  
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text(`Total TTC: ${(facture.total_ttc || 0).toFixed(2)} €`, 140, finalY + 15);
  
  // Pied de page
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.text('Merci de votre confiance', 105, 280, { align: 'center' });
  
  return doc;
};

export const downloadFacturePDF = (facture, client, articles, parametres) => {
  const doc = generateFacturePDF(facture, client, articles, parametres);
  doc.save(`Facture_${facture.numero}.pdf`);
};
