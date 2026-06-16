// Générateur PDF backend pour les téléchargements via QR code
// Version identique à src/utils/pdfGenerator.js mais sans QR code

/**
 * Génère un PDF de facture (version backend)
 * @param {Object} facture - Données de la facture
 * @param {Object} client - Données du client
 * @param {Object} parametres - Paramètres de l'entreprise
 * @param {string} logoBase64 - Logo en base64
 * @returns {Object} Configuration pour jsPDF
 */
export function generatePDFConfig(facture, client, parametres, logoBase64) {
  const devise = facture.devise || parametres?.devise || 'MAD';
  const fmt = (n) => `${(n || 0).toFixed(2)} ${devise}`;
  
  // Palette de couleurs NovaFact
  const colors = {
    gold: [212, 168, 83],
    dark: [8, 8, 7],
    gray: [200, 200, 200],
    white: [255, 255, 255],
    lightGray: [245, 245, 245],
    textGray: [80, 80, 80],
    darkText: [60, 60, 60],
    red: [239, 68, 68],
    mediumGray: [120, 120, 120]
  };

  return {
    facture,
    client,
    parametres,
    logoBase64,
    devise,
    fmt,
    colors
  };
}

/**
 * Instructions de génération du PDF
 * Ce format peut être utilisé côté client avec jsPDF
 */
export function getPDFInstructions(config) {
  const { facture, client, parametres, logoBase64, fmt, colors } = config;
  
  const instructions = {
    // Configuration de base
    format: 'A4',
    orientation: 'portrait',
    unit: 'mm',
    
    // Éléments à dessiner
    elements: []
  };

  // 1. Bordure dorée supérieure
  instructions.elements.push({
    type: 'line',
    x1: 10, y1: 10, x2: 200, y2: 10,
    color: colors.gold,
    lineWidth: 3
  });

  // 2. Logo NovaFact
  if (logoBase64) {
    instructions.elements.push({
      type: 'rect',
      x: 12, y: 13, width: 22, height: 22,
      fill: colors.white
    });
    instructions.elements.push({
      type: 'image',
      data: logoBase64,
      x: 12, y: 13, width: 22, height: 22,
      format: 'PNG'
    });
  }

  // 3. Nom entreprise
  instructions.elements.push({
    type: 'text',
    text: parametres?.nom_entreprise || 'NovaFact',
    x: 38, y: 22,
    fontSize: 16,
    fontStyle: 'bold',
    color: colors.gold
  });

  // 4. Coordonnées entreprise
  let yInfo = 28;
  const entrepriseInfo = [];
  
  if (parametres?.adresse) {
    entrepriseInfo.push({ text: parametres.adresse, y: yInfo });
    yInfo += 4.5;
  }
  
  if (parametres?.code_postal || parametres?.ville) {
    entrepriseInfo.push({
      text: `${parametres.code_postal || ''} ${parametres.ville || ''}`.trim(),
      y: yInfo
    });
    yInfo += 4.5;
  }
  
  if (parametres?.pays) {
    entrepriseInfo.push({ text: parametres.pays, y: yInfo });
    yInfo += 4.5;
  }
  
  if (parametres?.telephone) {
    entrepriseInfo.push({ text: `Tél: ${parametres.telephone}`, y: yInfo });
    yInfo += 4.5;
  }
  
  if (parametres?.email) {
    entrepriseInfo.push({ text: `Email: ${parametres.email}`, y: yInfo });
    yInfo += 4.5;
  }
  
  if (parametres?.siret) {
    entrepriseInfo.push({ text: `RC: ${parametres.siret}`, y: yInfo });
    yInfo += 4.5;
  }
  
  if (parametres?.ice) {
    entrepriseInfo.push({ text: `ICE: ${parametres.ice}`, y: yInfo });
    yInfo += 4.5;
  }
  
  if (parametres?.taxe_professionnelle) {
    entrepriseInfo.push({ text: `TP: ${parametres.taxe_professionnelle}`, y: yInfo });
  }
  
  entrepriseInfo.forEach(info => {
    instructions.elements.push({
      type: 'text',
      text: info.text,
      x: 38, y: info.y,
      fontSize: 8,
      fontStyle: 'normal',
      color: colors.textGray
    });
  });

  // 5. Bloc client
  const clientLines = [];
  if (client) {
    if (client.nom) clientLines.push(client.nom);
    if (client.adresse) clientLines.push(client.adresse);
    if (client.code_postal || client.ville) {
      clientLines.push(`${client.code_postal || ''} ${client.ville || ''}`.trim());
    }
    if (client.tel) clientLines.push(`Tél: ${client.tel}`);
    if (client.email) clientLines.push(client.email);
    if (client.ice) clientLines.push(`ICE: ${client.ice}`);
  }
  
  const clientBoxHeight = Math.max(35, 15 + (clientLines.length * 5));
  
  instructions.elements.push({
    type: 'rect',
    x: 130, y: 13, width: 68, height: clientBoxHeight,
    stroke: colors.gray,
    lineWidth: 0.5
  });
  
  instructions.elements.push({
    type: 'text',
    text: 'FACTURÉ À :',
    x: 134, y: 21,
    fontSize: 9,
    fontStyle: 'bold',
    color: colors.dark
  });
  
  let clientY = 27;
  clientLines.forEach(line => {
    instructions.elements.push({
      type: 'text',
      text: line,
      x: 134, y: clientY,
      fontSize: 8,
      fontStyle: 'normal',
      color: colors.darkText,
      maxWidth: 60
    });
    clientY += 4.5;
  });

  // 6. Titre FACTURE
  instructions.elements.push({
    type: 'text',
    text: 'FACTURE',
    x: 15, y: 58,
    fontSize: 22,
    fontStyle: 'bold',
    color: colors.gold
  });

  // 7. Infos facture (fond gris)
  instructions.elements.push({
    type: 'rect',
    x: 15, y: 62, width: 180, height: 18,
    fill: colors.lightGray
  });
  
  instructions.elements.push({
    type: 'text',
    text: `N° ${facture.numero}`,
    x: 20, y: 70,
    fontSize: 10,
    fontStyle: 'bold',
    color: colors.dark
  });
  
  instructions.elements.push({
    type: 'text',
    text: `Date : ${new Date(facture.date_creation).toLocaleDateString('fr-FR')}`,
    x: 20, y: 77,
    fontSize: 10,
    fontStyle: 'normal',
    color: colors.dark
  });
  
  if (facture.date_echeance) {
    instructions.elements.push({
      type: 'text',
      text: `Échéance : ${new Date(facture.date_echeance).toLocaleDateString('fr-FR')}`,
      x: 90, y: 77,
      fontSize: 10,
      fontStyle: 'normal',
      color: colors.dark
    });
  }
  
  instructions.elements.push({
    type: 'text',
    text: `Statut : ${facture.statut}`,
    x: 155, y: 70,
    fontSize: 10,
    fontStyle: 'bold',
    color: colors.dark
  });

  // 8. Tableau articles
  const tableData = (facture.articles || []).map(item => {
    const qty = parseFloat(item.quantite) || 0;
    const pu = parseFloat(item.prix_unitaire) || 0;
    const rem = parseFloat(item.remise) || 0;
    const tot = qty * pu * (1 - rem / 100);
    return [
      item.designation || item.description || '-',
      qty.toString(),
      `${pu.toFixed(2)} ${config.devise}`,
      rem > 0 ? `${rem}%` : '-',
      `${(item.tva || 20)}%`,
      `${tot.toFixed(2)} ${config.devise}`
    ];
  });
  
  instructions.elements.push({
    type: 'table',
    startY: 84,
    head: [['Désignation', 'Qté', 'Prix Unit.', 'Remise', 'TVA', 'Total HT']],
    body: tableData,
    headStyles: {
      fillColor: colors.gold,
      textColor: colors.white,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [40, 40, 40]
    },
    columnStyles: {
      0: { cellWidth: 65, halign: 'left' },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 28, halign: 'right' }
    }
  });

  // 9. Totaux
  const totalsHeight = facture.remise_globale > 0 ? 40 : 28;
  
  instructions.elements.push({
    type: 'totals',
    y: 'afterTable',
    yOffset: 6,
    totalsHeight: totalsHeight,
    values: {
      total_ht: fmt(facture.total_ht),
      remise_globale: facture.remise_globale,
      remise_montant: fmt(facture.remise_montant),
      total_apres_remise: fmt(facture.total_apres_remise),
      tva: fmt(facture.tva),
      total_ttc: fmt(facture.total_ttc)
    }
  });

  // 10. Informations de paiement
  const hasPaymentInfo = facture.mode_paiement || facture.type_virement || 
                         facture.date_depot || facture.date_encaissement;
  
  if (hasPaymentInfo) {
    instructions.elements.push({
      type: 'paymentInfo',
      mode_paiement: facture.mode_paiement,
      type_virement: facture.type_virement,
      date_depot: facture.date_depot,
      date_encaissement: facture.date_encaissement
    });
  }

  // 11. Signature
  if (facture.signature) {
    instructions.elements.push({
      type: 'signature',
      data: facture.signature,
      label: 'Signature',
      sublabel: 'Signature numérique'
    });
  }

  // 12. Conditions de paiement
  instructions.elements.push({
    type: 'paymentTerms',
    text: "Paiement à réception · Pénalités de retard : 3× le taux légal · Indemnité forfaitaire : 40 MAD"
  });

  // 13. Pied de page
  instructions.elements.push({
    type: 'footer',
    line: { y: 270, x1: 15, x2: 195, color: colors.gold, lineWidth: 0.8 },
    texts: [
      { text: 'Merci de votre confiance', y: 275 },
      { text: 'Document téléchargé via QR Code', y: 280 }
    ]
  });

  return instructions;
}

/**
 * Formatte les données pour l'API
 */
export function formatInvoiceData(facture, client, parametres) {
  return {
    facture: {
      id: facture._id || facture.id,
      numero: facture.numero,
      date_creation: facture.date_creation,
      date_echeance: facture.date_echeance,
      statut: facture.statut,
      articles: facture.articles || [],
      total_ht: facture.total_ht,
      tva: facture.tva,
      total_ttc: facture.total_ttc,
      remise_globale: facture.remise_globale || 0,
      remise_montant: facture.remise_montant || 0,
      total_apres_remise: facture.total_apres_remise || facture.total_ht,
      mode_paiement: facture.mode_paiement,
      type_virement: facture.type_virement,
      date_depot: facture.date_depot,
      date_encaissement: facture.date_encaissement,
      signature: facture.signature,
      devise: facture.devise || parametres?.devise || 'MAD'
    },
    client: client ? {
      nom: client.nom,
      adresse: client.adresse,
      code_postal: client.code_postal,
      ville: client.ville,
      tel: client.tel,
      email: client.email,
      ice: client.ice
    } : null,
    parametres: parametres ? {
      nom_entreprise: parametres.nom_entreprise,
      adresse: parametres.adresse,
      code_postal: parametres.code_postal,
      ville: parametres.ville,
      pays: parametres.pays,
      telephone: parametres.telephone,
      email: parametres.email,
      siret: parametres.siret,
      ice: parametres.ice,
      taxe_professionnelle: parametres.taxe_professionnelle,
      devise: parametres.devise || 'MAD'
    } : null
  };
}
