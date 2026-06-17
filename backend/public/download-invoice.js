// PDF Generator for QR Code Download - v3.0 CLEAN
console.log('download-invoice.js loaded OK');

var logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsTAAALEwEAmpwYAAABNmlDQ1BpY2MAABiVY2BgMnB0cXJlEmBgyM0rKQpyd1KIiIxSYD/PwMbAzAAGicnFBY4BAT4gdl5+XioDBvh+qXgYMoUQW4CMPgYg+zUD/////8K1AwODvP///3////8PUPkZmMwBcgVBegC8r7AwMEhRREhXQjbyCFSDKHPnmLBgYGRgYOBKKUlNYWBgYE9HyGZnVxYW5mbmZlEQMzAzAAAAALMLB0NDQ0MAAACRSUQBSTY1NwAAAABbAAAAAAAAFSwBAAAAAAAAAQAAAAB';
var factureData = null;

var tr = {
    invoice: 'FACTURE',
    billedTo: 'FACTURE A:',
    invoiceNumber: 'No',
    date: 'Date:',
    dueDate: 'Echeance:',
    status: 'Statut:',
    designation: 'Designation',
    quantity: 'Qte',
    unitPrice: 'Prix Unit.',
    discount: 'Remise',
    vat: 'TVA',
    totalHT: 'Total HT',
    subtotal: 'Total HT:',
    globalDiscount: 'Remise globale',
    afterDiscount: 'Apres remise:',
    vatTotal: 'TVA:',
    totalTTC: 'Total TTC:',
    paymentInfo: 'Informations de paiement',
    paymentMethod: 'Mode:',
    transferType: 'Type virement:',
    depositDate: 'Depot:',
    collectionDate: 'Encaissement:',
    signature: 'Signature',
    digitalSignature: 'Signature numerique',
    paymentTerms: 'Conditions de paiement',
    termsText: 'Paiement a reception - Penalites de retard: 3x le taux legal - Indemnite forfaitaire: 40 MAD',
    thankYou: 'Merci de votre confiance',
    statusPaid: 'Payee',
    statusPending: 'En attente',
    statusRejected: 'Rejetee'
};

function loadInvoice() {
    try {
        console.log('Loading invoice...');
        var pathParts = window.location.pathname.split('/');
        var invoiceId = pathParts[pathParts.length - 1];
        console.log('Invoice ID:', invoiceId);

        fetch('/api/factures/download/' + invoiceId)
            .then(function(response) {
                console.log('Server response:', response.status);
                if (!response.ok) {
                    throw new Error('Invoice not found (' + response.status + ')');
                }
                return response.json();
            })
            .then(function(data) {
                console.log('Data loaded OK');
                factureData = data;
                downloadPDF();
            })
            .catch(function(error) {
                console.error('Error:', error);
                document.querySelector('.loading').style.display = 'none';
                document.getElementById('error').style.display = 'block';
                document.getElementById('error').innerHTML = '<h3>Erreur</h3><p>' + error.message + '</p>';
            });
    } catch(e) {
        console.error('Fatal error:', e);
    }
}

function downloadPDF() {
    if (!factureData) { return; }

    try {
        var jsPDF = window.jspdf && window.jspdf.jsPDF;
        if (!jsPDF) { throw new Error('jsPDF not loaded'); }
        console.log('jsPDF OK, generating PDF...');

        var doc = new jsPDF();
        var facture = factureData.facture;
        var client = factureData.client;
        var parametres = factureData.parametres || {};
        var signatureDataUrl = facture.signature;

        var gold = [212, 168, 83];
        var dark = [8, 8, 7];
        var gray = [200, 200, 200];
        var devise = (parametres && parametres.devise) ? parametres.devise : 'MAD';

        function fmt(n) {
            return ((n || 0).toFixed(2)) + ' ' + devise;
        }

        // Gold top border
        doc.setDrawColor(gold[0], gold[1], gold[2]);
        doc.setLineWidth(3);
        doc.line(10, 10, 200, 10);

        // Logo
        try {
            doc.setFillColor(255, 255, 255);
            doc.rect(12, 13, 22, 22, 'F');
            doc.addImage(logoBase64, 'PNG', 12, 13, 22, 22);
        } catch(e) {
            console.warn('Logo not added:', e.message);
        }

        // Company name
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(gold[0], gold[1], gold[2]);
        doc.text((parametres.nom_entreprise || 'NovaFact'), 38, 22);

        // Company info
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(80, 80, 80);
        var infoLines = [];
        if (parametres.adresse) infoLines.push(parametres.adresse);
        var ville = ((parametres.code_postal || '') + ' ' + (parametres.ville || '')).trim();
        if (ville) infoLines.push(ville);
        if (parametres.telephone) infoLines.push('Tel: ' + parametres.telephone);
        if (parametres.email) infoLines.push('Email: ' + parametres.email);
        if (parametres.siret) infoLines.push('RC: ' + parametres.siret);
        for (var i = 0; i < infoLines.length; i++) {
            doc.text(infoLines[i], 38, 28 + i * 4.5);
        }

        // Client box
        doc.setDrawColor(gray[0], gray[1], gray[2]);
        doc.setLineWidth(0.5);
        doc.rect(130, 13, 68, 35);
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(dark[0], dark[1], dark[2]);
        doc.text(tr.billedTo, 134, 21);
        doc.setFontSize(8.5);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(60, 60, 60);
        var clientY = 28;
        if (client) {
            if (client.nom) { doc.text(client.nom, 134, clientY); clientY += 5; }
            if (client.adresse) { doc.text(client.adresse, 134, clientY); clientY += 5; }
            if (client.tel) { doc.text('Tel: ' + client.tel, 134, clientY); clientY += 5; }
            if (client.email) { doc.text(client.email, 134, clientY); }
        }

        // FACTURE title
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(gold[0], gold[1], gold[2]);
        doc.text(tr.invoice, 15, 58);

        // Invoice info box
        doc.setFillColor(245, 245, 245);
        doc.rect(15, 62, 180, 18, 'F');
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(dark[0], dark[1], dark[2]);
        doc.text(tr.invoiceNumber + ' ' + facture.numero, 20, 70);
        doc.setFont(undefined, 'normal');
        doc.text(tr.date + ' ' + new Date(facture.date_creation).toLocaleDateString('fr-FR'), 20, 77);
        if (facture.date_echeance) {
            doc.text(tr.dueDate + ' ' + new Date(facture.date_echeance).toLocaleDateString('fr-FR'), 90, 77);
        }
        var statutText = facture.statut === 'Payee' ? tr.statusPaid :
                         facture.statut === 'En attente' ? tr.statusPending :
                         facture.statut === 'Rejetee' ? tr.statusRejected : (facture.statut || '');
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text(tr.status + ' ' + statutText, 155, 70);

        // Articles table
        var tableData = [];
        var articles = facture.articles || [];
        for (var ai = 0; ai < articles.length; ai++) {
            var item = articles[ai];
            var qty = parseFloat(item.quantite) || 0;
            var pu = parseFloat(item.prix_unitaire) || 0;
            var rem = parseFloat(item.remise) || 0;
            var tot = qty * pu * (1 - rem / 100);
            tableData.push([
                item.designation || item.description || '-',
                qty.toString(),
                pu.toFixed(2) + ' ' + devise,
                rem > 0 ? rem + '%' : '-',
                (item.tva || 20) + '%',
                tot.toFixed(2) + ' ' + devise
            ]);
        }

        doc.autoTable({
            startY: 84,
            head: [[tr.designation, tr.quantity, tr.unitPrice, tr.discount, tr.vat, tr.totalHT]],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: gold, textColor: [255,255,255], fontSize: 8, fontStyle: 'bold', halign: 'center', cellPadding: 2 },
            bodyStyles: { fontSize: 7.5, textColor: [40,40,40], cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 65, halign: 'left' },
                1: { cellWidth: 15, halign: 'center' },
                2: { cellWidth: 28, halign: 'right' },
                3: { cellWidth: 20, halign: 'center' },
                4: { cellWidth: 15, halign: 'center' },
                5: { cellWidth: 28, halign: 'right' }
            },
            alternateRowStyles: { fillColor: [248,248,248] },
            margin: { left: 15, right: 15 }
        });

        // Totals
        var y = ((doc.previousAutoTable && doc.previousAutoTable.finalY) || 140) + 6;
        var totalsHeight = facture.remise_globale > 0 ? 40 : 28;
        doc.setFillColor(245, 245, 245);
        doc.rect(110, y, 85, totalsHeight, 'F');
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(60, 60, 60);

        doc.text(tr.subtotal, 115, y + 6);
        doc.text(fmt(facture.total_ht), 192, y + 6, { align: 'right' });

        if (facture.remise_globale > 0) {
            doc.setTextColor(239, 68, 68);
            doc.text(tr.globalDiscount + ' (' + facture.remise_globale + '%)', 115, y + 12);
            doc.text('-' + fmt(facture.remise_montant), 192, y + 12, { align: 'right' });
            doc.setTextColor(60, 60, 60);
            doc.text(tr.afterDiscount, 115, y + 18);
            doc.text(fmt(facture.total_apres_remise), 192, y + 18, { align: 'right' });
        }

        var tvay = facture.remise_globale > 0 ? y + 24 : y + 12;
        doc.setTextColor(60, 60, 60);
        doc.text(tr.vatTotal, 115, tvay);
        doc.text(fmt(facture.tva), 192, tvay, { align: 'right' });

        var ttcy = tvay + 7;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(10);
        doc.setTextColor(gold[0], gold[1], gold[2]);
        doc.text(tr.totalTTC, 115, ttcy);
        doc.text(fmt(facture.total_ttc), 192, ttcy, { align: 'right' });

        // Bottom section
        y = y + totalsHeight + 8;
        var leftY = y;

        // Payment info
        if (facture.mode_paiement || facture.type_virement || facture.date_depot || facture.date_encaissement) {
            doc.setFontSize(8);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(dark[0], dark[1], dark[2]);
            doc.text(tr.paymentInfo, 15, leftY);
            doc.setFontSize(7);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(60, 60, 60);
            leftY += 4;
            if (facture.mode_paiement) { doc.text(tr.paymentMethod + ' ' + facture.mode_paiement, 15, leftY); leftY += 4; }
            if (facture.type_virement) { doc.text(tr.transferType + ' ' + facture.type_virement, 15, leftY); leftY += 4; }
            if (facture.date_depot) { doc.text(tr.depositDate + ' ' + new Date(facture.date_depot).toLocaleDateString('fr-FR'), 15, leftY); leftY += 4; }
            if (facture.date_encaissement) { doc.text(tr.collectionDate + ' ' + new Date(facture.date_encaissement).toLocaleDateString('fr-FR'), 15, leftY); leftY += 4; }
            leftY += 3;
        }

        // Signature
        if (signatureDataUrl && signatureDataUrl.indexOf('data:image') === 0) {
            try {
                doc.setFontSize(8);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(dark[0], dark[1], dark[2]);
                doc.text(tr.signature, 15, leftY);
                doc.addImage(signatureDataUrl, 'PNG', 15, leftY + 2, 50, 16);
                doc.setDrawColor(gray[0], gray[1], gray[2]);
                doc.setLineWidth(0.2);
                doc.line(15, leftY + 19, 65, leftY + 19);
                doc.setFontSize(6);
                doc.setFont(undefined, 'italic');
                doc.setTextColor(120, 120, 120);
                doc.text(tr.digitalSignature, 15, leftY + 23);
            } catch(e) {
                console.warn('Signature skipped:', e.message);
            }
        }

        // Payment terms
        doc.setFontSize(7);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(dark[0], dark[1], dark[2]);
        doc.text(tr.paymentTerms, 110, y);
        doc.setFontSize(6.5);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(80, 80, 80);
        var splitTerms = doc.splitTextToSize(tr.termsText, 85);
        doc.text(splitTerms, 110, y + 4);

        // Footer
        doc.setDrawColor(gold[0], gold[1], gold[2]);
        doc.setLineWidth(0.8);
        doc.line(15, 270, 195, 270);
        doc.setFontSize(6.5);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(120, 120, 120);
        doc.text(tr.thankYou, 105, 275, { align: 'center' });
        doc.text('Document telecharge via QR Code', 105, 280, { align: 'center' });

        doc.save('Facture_' + facture.numero + '.pdf');
        console.log('PDF saved!');

        document.querySelector('.loading').innerHTML = 'PDF telecharge ! Vous pouvez fermer cette page.';

    } catch(error) {
        console.error('PDF error:', error);
        document.querySelector('.loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').innerHTML = '<h3>Erreur PDF</h3><p>' + error.message + '</p>';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadInvoice);
} else {
    loadInvoice();
}