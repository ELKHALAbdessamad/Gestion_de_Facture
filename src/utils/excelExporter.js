import * as XLSX from 'xlsx';

/**
 * Export de la liste des factures vers Excel (.xlsx)
 */
export const exportFacturesToExcel = (factures, clients) => {
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.nom : 'Client inconnu';
  };

  // Données pour la feuille principale "Factures"
  const facturesData = factures.map(f => ({
    'Numéro': f.numero || '',
    'Date Création': f.date_creation ? new Date(f.date_creation).toLocaleDateString('fr-FR') : '',
    'Client': getClientName(f.client_id),
    'Statut': f.statut || '',
    'Total HT (MAD)': Number((f.total_ht || 0).toFixed(2)),
    'Remise Globale (%)': f.remise_globale || 0,
    'TVA (MAD)': Number((f.tva || 0).toFixed(2)),
    'Total TTC (MAD)': Number((f.total_ttc || 0).toFixed(2)),
    'Mode Paiement': f.mode_paiement || '',
    'Type Virement': f.type_virement || '',
    'Date Dépôt': f.date_depot ? new Date(f.date_depot).toLocaleDateString('fr-FR') : '',
    'Date Encaissement': f.date_encaissement ? new Date(f.date_encaissement).toLocaleDateString('fr-FR') : '',
    'Validé Admin': f.validated_by_admin ? 'Oui' : 'Non',
    'Validé Par': f.validated_by || '',
  }));

  // Données pour la feuille "Articles par Facture"
  const articlesData = [];
  factures.forEach(f => {
    (f.articles || []).forEach(a => {
      articlesData.push({
        'Numéro Facture': f.numero || '',
        'Client': getClientName(f.client_id),
        'Désignation': a.designation || '',
        'Quantité': a.quantite || 0,
        'Prix Unitaire (MAD)': a.prix_unitaire || 0,
        'Remise Ligne (%)': a.remise || 0,
        'TVA Ligne (%)': a.tva || 20,
        'Total Ligne (MAD)': Number(((a.quantite || 0) * (a.prix_unitaire || 0) * (1 - (a.remise || 0) / 100)).toFixed(2)),
      });
    });
  });

  // Données pour la feuille "Statistiques"
  const payees = factures.filter(f => f.statut === 'Payée');
  const enAttente = factures.filter(f => f.statut === 'En attente');
  const rejetees = factures.filter(f => f.statut === 'Rejetée');
  const drafts = factures.filter(f => f.statut === 'Draft');

  const statsData = [
    { 'Indicateur': 'Total Factures', 'Valeur': factures.length },
    { 'Indicateur': 'Factures Payées', 'Valeur': payees.length },
    { 'Indicateur': 'Factures En Attente', 'Valeur': enAttente.length },
    { 'Indicateur': 'Factures Rejetées', 'Valeur': rejetees.length },
    { 'Indicateur': 'Brouillons', 'Valeur': drafts.length },
    { 'Indicateur': '---', 'Valeur': '---' },
    {
      'Indicateur': 'CA Total Encaissé (MAD)',
      'Valeur': Number(payees.reduce((s, f) => s + (f.total_ttc || 0), 0).toFixed(2))
    },
    {
      'Indicateur': 'Montant En Attente (MAD)',
      'Valeur': Number(enAttente.reduce((s, f) => s + (f.total_ttc || 0), 0).toFixed(2))
    },
    {
      'Indicateur': 'Montant Rejeté (MAD)',
      'Valeur': Number(rejetees.reduce((s, f) => s + (f.total_ttc || 0), 0).toFixed(2))
    },
    {
      'Indicateur': 'Montant Moyen / Facture (MAD)',
      'Valeur': factures.length > 0
        ? Number((factures.reduce((s, f) => s + (f.total_ttc || 0), 0) / factures.length).toFixed(2))
        : 0
    },
  ];

  // Créer le workbook
  const wb = XLSX.utils.book_new();

  // Feuille 1 : Factures
  const ws1 = XLSX.utils.json_to_sheet(facturesData);
  styleSheet(ws1, Object.keys(facturesData[0] || {}).length);
  XLSX.utils.book_append_sheet(wb, ws1, 'Factures');

  // Feuille 2 : Articles
  if (articlesData.length > 0) {
    const ws2 = XLSX.utils.json_to_sheet(articlesData);
    styleSheet(ws2, Object.keys(articlesData[0] || {}).length);
    XLSX.utils.book_append_sheet(wb, ws2, 'Articles par Facture');
  }

  // Feuille 3 : Statistiques
  const ws3 = XLSX.utils.json_to_sheet(statsData);
  styleSheet(ws3, 2);
  XLSX.utils.book_append_sheet(wb, ws3, 'Statistiques');

  // Télécharger
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Factures_Export_${date}.xlsx`);
};

/**
 * Export de la liste des clients vers Excel
 */
export const exportClientsToExcel = (clients, factures) => {
  const clientsData = clients.map(c => {
    const clientFactures = factures.filter(f => f.client_id === c.id);
    const totalCA = clientFactures
      .filter(f => f.statut === 'Payée')
      .reduce((s, f) => s + (f.total_ttc || 0), 0);

    return {
      'Nom': c.nom || '',
      'Email': c.email || '',
      'Téléphone': c.tel || '',
      'Adresse': c.adresse || '',
      'Nb Factures': clientFactures.length,
      'CA Total (MAD)': Number(totalCA.toFixed(2)),
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(clientsData);
  styleSheet(ws, Object.keys(clientsData[0] || {}).length);
  XLSX.utils.book_append_sheet(wb, ws, 'Clients');

  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Clients_Export_${date}.xlsx`);
};

// Largeur automatique des colonnes
const styleSheet = (ws, colCount) => {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  const colWidths = [];
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxWidth = 10;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      if (cell && cell.v) {
        maxWidth = Math.max(maxWidth, String(cell.v).length + 2);
      }
    }
    colWidths.push({ wch: Math.min(maxWidth, 40) });
  }
  ws['!cols'] = colWidths;
};
