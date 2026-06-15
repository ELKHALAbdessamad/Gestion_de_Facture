// ─── Archivage annuel des factures ────────────────────────────────────────
// Génère un fichier ZIP contenant :
//   - Un PDF par facture de l'année sélectionnée
//   - Un fichier Excel récapitulatif
//   - Un fichier JSON de sauvegarde complète
//
// Utilise : jszip + file-saver

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateFacturePDF } from './pdfGenerator';
import * as XLSX from 'xlsx';

// ── Génération de l'archive ZIP annuelle ──────────────────────────────────────
export const archiveAnnee = async (annee, factures, clients, parametres, onProgress) => {
  const zip = new JSZip();

  // Filtrer les factures de l'année
  const facturesAnnee = factures.filter(f => {
    if (!f.date_creation) return false;
    return new Date(f.date_creation).getFullYear() === parseInt(annee);
  });

  if (facturesAnnee.length === 0) {
    throw new Error(`Aucune facture trouvée pour l'année ${annee}`);
  }

  const pdfFolder  = zip.folder(`Factures_PDF_${annee}`);
  const total      = facturesAnnee.length;
  let   processed  = 0;

  // 1. Générer un PDF par facture
  for (const facture of facturesAnnee) {
    try {
      const client = clients.find(c => c.id === facture.client_id);
      if (client) {
        const doc      = await generateFacturePDF(facture, client, [], parametres);
        const pdfBytes = doc.output('arraybuffer');
        pdfFolder.file(`Facture_${facture.numero}.pdf`, pdfBytes);
      }
    } catch (e) {
      console.warn(`PDF non généré pour ${facture.numero}:`, e.message);
    }
    processed++;
    if (onProgress) onProgress(Math.round((processed / total) * 70)); // 0→70%
  }

  // 2. Excel récapitulatif
  const getClientName = (cid) => clients.find(c => c.id === cid)?.nom || 'Inconnu';
  const excelData     = facturesAnnee.map(f => ({
    'Numéro'       : f.numero || '',
    'Date'         : f.date_creation ? new Date(f.date_creation).toLocaleDateString('fr-FR') : '',
    'Client'       : getClientName(f.client_id),
    'Statut'       : f.statut || '',
    'Total HT'     : Number((f.total_ht || 0).toFixed(2)),
    'TVA'          : Number((f.tva || 0).toFixed(2)),
    'Total TTC'    : Number((f.total_ttc || 0).toFixed(2)),
    'Validé Admin' : f.validated_by_admin ? 'Oui' : 'Non',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wb, ws, `Factures ${annee}`);
  const xlsxBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  zip.file(`Recapitulatif_${annee}.xlsx`, xlsxBuffer);

  if (onProgress) onProgress(85);

  // 3. JSON de sauvegarde complète (conformité archivage légal 10 ans)
  const backup = {
    annee,
    export_date    : new Date().toISOString(),
    nb_factures    : facturesAnnee.length,
    total_ht       : facturesAnnee.reduce((s, f) => s + (f.total_ht || 0), 0),
    total_ttc      : facturesAnnee.reduce((s, f) => s + (f.total_ttc || 0), 0),
    ca_encaisse    : facturesAnnee.filter(f => f.statut === 'Payée').reduce((s, f) => s + (f.total_ttc || 0), 0),
    factures       : facturesAnnee,
    clients_concernes: clients.filter(c =>
      facturesAnnee.some(f => f.client_id === c.id)
    ),
  };
  zip.file(`Backup_${annee}.json`, JSON.stringify(backup, null, 2));

  // 4. README dans l'archive
  zip.file('README.txt',
    `ARCHIVE ANNUELLE DES FACTURES — ${annee}\n` +
    `Générée le : ${new Date().toLocaleString('fr-FR')}\n\n` +
    `Contenu de cette archive :\n` +
    `  - Factures_PDF_${annee}/  : ${facturesAnnee.length} factures au format PDF\n` +
    `  - Recapitulatif_${annee}.xlsx : Tableau récapitulatif Excel\n` +
    `  - Backup_${annee}.json : Données brutes (sauvegarde légale)\n\n` +
    `Cette archive constitue une preuve d'archivage conforme à l'obligation\n` +
    `de conservation des factures (10 ans selon la législation marocaine).\n`
  );

  if (onProgress) onProgress(95);

  // 5. Générer et télécharger le ZIP
  const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  saveAs(content, `Archives_Factures_${annee}.zip`);

  if (onProgress) onProgress(100);
  return facturesAnnee.length;
};

// ── Liste des années disponibles dans les factures ────────────────────────────
export const getAvailableYears = (factures) => {
  const years = [...new Set(
    factures
      .map(f => f.date_creation && new Date(f.date_creation).getFullYear())
      .filter(Boolean)
  )].sort((a, b) => b - a);
  return years;
};
