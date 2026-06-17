// ===================================================================
// Test immediat - Script charge
// ===================================================================
alert('✅ Le script JavaScript est charge!');
console.log('✅ Script download-invoice.js charge!');

const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsTAAALEwEAmpwYAAABNmlDQ1BpY2MAABiVY2BgMnB0cXJlEmBgyM0rKQpyd1KIiIxSYD/PwMbAzAAGicnFBY4BAT4gdl5+XioDBvh+qXgYMoUQW4CMPgYg+zUD/////8K1AwODvP///3////8PUPkZmMwBcgVBegC8r7AwMEhRREhXQjbyCFSDKHPnmLBgYGRgYOBKKUlNYWBgYE9HyGZnVxYW5mbmZlEQMzAzAAAAALMLB0NDQ0MAAACRSUQBSTY1NwAAAABbAAAAAAAAFSwBAAAAAAAAAQAAAAB';
let factureData = null;

const tr = {
    invoice: 'FACTURE',
    billedTo: 'FACTURE A :',
    invoiceNumber: 'N°',
    date: 'Date :',
    dueDate: 'Echeance :',
    status: 'Statut :',
    designation: 'Designation',
    quantity: 'Qte',
    unitPrice: 'Prix Unit.',
    discount: 'Remise',
    vat: 'TVA',
    totalHT: 'Total HT',
    subtotal: 'Total HT :',
    globalDiscount: 'Remise globale',
    afterDiscount: 'Apres remise :',
    vatTotal: 'TVA :',
    totalTTC: 'Total TTC :',
    paymentInfo: 'Informations de paiement',
    paymentMethod: 'Mode :',
    transferType: 'Type virement :',
    depositDate: 'Depot :',
    collectionDate: 'Encaissement :',
    signature: 'Signature',
    digitalSignature: 'Signature numerique',
    paymentTerms: 'Conditions de paiement',
    termsText: "Paiement a reception · Penalites de retard : 3× le taux legal · Indemnite forfaitaire : 40 MAD",
    thankYou: 'Merci de votre confiance',
    statusPaid: 'Payee',
    statusPending: 'En attente',
    statusRejected: 'Rejetee'
};

async function loadInvoice() {
    try {
        console.log('🔄 Debut chargement facture...');
        const pathParts = window.location.pathname.split('/');
        const invoiceId = pathParts[pathParts.length - 1];
        
        console.log('📋 ID facture:', invoiceId);
        
        const response = await fetch(`/api/factures/download/${invoiceId}`);
        
        console.log('📡 Reponse serveur:', response.status);
        
        if (!response.ok) {
            throw new Error(`Facture introuvable (${response.status})`);
        }
        
        const data = await response.json();
        console.log('✅ Donnees chargees:', data);
        
        factureData = data;
        
        console.log('📥 Telechargement PDF...');
        downloadPDF();
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        document.querySelector('.loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').innerHTML = `
            <h3>❌ Erreur</h3>
            <p>${error.message}</p>
            <p style="font-size:12px;margin-top:10px;">ID: ${window.location.pathname.split('/').pop()}</p>
        `;
    }
}

function downloadPDF() {
    if (!factureData) {
        console.error('❌ Pas de donnees facture');
        return;
    }
    
    try {
        console.log('🔍 Verification jsPDF...');
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            throw new Error('jsPDF non charge');
        }
        console.log('✅ jsPDF disponible');
        
    const doc = new jsPDF();
    const facture = factureData.facture;
    const client = factureData.client;
    const parametres = factureData.parametres || {};
    const signatureDataUrl = facture.signature;
    
    const gold = [212, 168, 83];
    const dark = [8, 8, 7];
    const gray = [200, 200, 200];
    const devise = parametres?.devise || 'MAD';
    const fmt = (n) => `${(n || 0).toFixed(2)} ${devise}`;
    
    console.log('📄 Creation PDF...');
    
    doc.setDrawColor(...gold);
    doc.setLineWidth(3);
    doc.line(10, 10, 200, 10);
    
    if (logoBase64) {
        doc.setFillColor(255, 255, 255);
        doc.rect(12, 13, 22, 22, 'F');
        doc.addImage(logoBase64, 'PNG', 12, 13, 22, 22);
    }
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...gold);
    doc.text(parametres.nom_entreprise || 'NovaFact', 38, 22);
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80, 80, 80);
    const infoLines = [
        parametres.adresse,
        `${parametres.code_postal || ''} ${parametres.ville || ''}`.trim(),
        parametres.telephone ? `Tel: ${parametres.telephone}` : null,
        parametres.email ? `Email: ${parametres.email}` : null,
        parametres.siret ? `RC: ${parametres.siret}` : null,
    ].filter(Boolean);
    infoLines.forEach((line, i) => doc.text(line, 38, 28 + i * 4.5));
    
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
        if (client.tel)     { doc.text(`Tel: ${client.tel}`, 134, clientY); clientY += 5; }
        if (client.email)   { doc.text(client.email, 134, clientY); }
    }
    
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
    doc.text(`${tr.date} ${new Date(facture.date_creation).toLocaleDateString('fr-FR')}`, 20, 77);
    if (facture.date_echeance) {
        doc.text(`${tr.dueDate} ${new Date(facture.date_echeance).toLocaleDateString('fr-FR')}`, 90, 77);
    }
    const statutText = 
        facture.statut === 'Payee' ? tr.statusPaid :
        facture.statut === 'En attente' ? tr.statusPending :
        facture.statut === 'Rejetee' ? tr.statusRejected : facture.statut;
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(`${tr.status} ${statutText}`, 155, 70);
    
    const tableData = (facture.articles || []).map(item => {
        const qty = parseFloat(item.quantite) || 0;
        const pu = parseFloat(item.prix_unitaire) || 0;
        const rem = parseFloat(item.remise) || 0;
        const st = qty * pu;
        const tot = st * (1 - rem / 100);
        return [
            item.designation || item.description || '-',
            qty.toString(),
            `${pu.toFixed(2)} ${devise}`,
            rem > 0 ? `${rem}%` : '-',
            `${(item.tva || 20)}%`,
            `${tot.toFixed(2)} ${devise}`,
        ];
    });
    
    doc.autoTable({
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
    
    y = y + totalsHeight + 8;
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
        if (facture.date_depot)        { doc.text(`${tr.depositDate} ${new Date(facture.date_depot).toLocaleDateString('fr-FR')}`, 15, leftY); leftY += 4; }
        if (facture.date_encaissement) { doc.text(`${tr.collectionDate} ${new Date(facture.date_encaissement).toLocaleDateString('fr-FR')}`, 15, leftY); leftY += 4; }
        leftY += 3;
    }
    
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
    
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...dark);
    doc.text(tr.paymentTerms, 110, y);
    doc.setFontSize(6.5);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80, 80, 80);
    const splitConditions = doc.splitTextToSize(tr.termsText, 85);
    doc.text(splitConditions, 110, y + 4);
    
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.8);
    doc.line(15, 270, 195, 270);
    doc.setFontSize(6.5);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text(tr.thankYou, 105, 275, { align: 'center' });
    doc.text('Document telecharge via QR Code', 105, 280, { align: 'center' });
    
    console.log('💾 Sauvegarde PDF...');
    doc.save(`Facture_${facture.numero}.pdf`);
    
    console.log('✅ PDF telecharge avec succes!');
    
    document.querySelector('.loading').innerHTML = '✅ PDF telecharge !<br><small>Vous pouvez fermer cette page</small>';
    
    } catch (error) {
        console.error('❌ Erreur generation PDF:', error);
        document.querySelector('.loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').innerHTML = `
            <h3>❌ Erreur PDF</h3>
            <p>${error.message}</p>
            <pre style="font-size:10px;text-align:left;margin-top:10px;">${error.stack}</pre>
        `;
    }
}

console.log('🚀 Initialisation du script...');
if (document.readyState === 'loading') {
    console.log('⏳ DOM en cours de chargement, attente DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', function() {
        console.log('✅ DOM charge, lancement loadInvoice()');
        loadInvoice();
    });
} else {
    console.log('✅ DOM deja charge, lancement immediat loadInvoice()');
    loadInvoice();
}
/ /   U p d a t e  
 