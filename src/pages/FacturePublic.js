import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, CircularProgress, Container,
  Table, TableBody, TableCell, TableHead, TableRow, Chip, Divider
} from '@mui/material';
import { GetApp, CheckCircle } from '@mui/icons-material';
import { getArticles, getParametres } from '../services/jsonService';
import { getFacturePublic, getClientsPublic } from '../services/factureProxy';
import { downloadFacturePDF } from '../utils/pdfGenerator';
import { formatMoney } from '../utils/currency';
import { notify } from '../services/notificationService';

export const FacturePublic = () => {
  const { id } = useParams();
  const [facture, setFacture] = useState(null);
  const [client, setClient] = useState(null);
  const [articles, setArticles] = useState([]);
  const [parametres, setParametres] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [language] = useState('fr'); // Langue par défaut pour vue publique

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[FacturePublic] Début chargement facture', id);
        
        // Utiliser le proxy HTTP pour Firebase (fonctionne mieux sur mobile)
        const [factureData, clientsData, articlesData, parametresData] = await Promise.all([
          getFacturePublic(id),
          getClientsPublic(),
          getArticles(),
          getParametres()
        ]);
        
        console.log('[FacturePublic] Données chargées:', { factureData, clients: clientsData?.length });
        
        if (!factureData) {
          console.error('[FacturePublic] Facture introuvable');
          notify.error('Facture introuvable');
          return;
        }

        setFacture(factureData);
        setArticles(articlesData || []);
        setParametres(parametresData || { devise: 'MAD' });
        setClient(clientsData?.find(c => c.id === factureData.client_id) || null);
        
        console.log('[FacturePublic] Configuration terminée');
      } catch (error) {
        console.error('[FacturePublic] Erreur de chargement:', error);
        notify.error(`Erreur: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!facture || !client) return;
    setPdfLoading(true);
    try {
      await downloadFacturePDF(facture, client, articles, parametres, null, language);
      notify.pdfGenere(facture.numero);
    } catch (e) {
      notify.error('Erreur génération PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#080807">
        <CircularProgress sx={{ color: '#D4A853' }} />
      </Box>
    );
  }

  if (!facture) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#080807">
        <Typography color="white">Facture introuvable</Typography>
      </Box>
    );
  }

  const devise = parametres?.devise || 'MAD';
  const statusColor = facture.statut === 'Payée' ? 'success' : facture.statut === 'En attente' ? 'warning' : 'error';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#080807', py: 4 }}>
      <Container maxWidth="md">
        {/* En-tête */}
        <Paper sx={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 3,
          p: 3,
          mb: 3
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', mb: 1 }}>
                Facture N° {facture.numero}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Date : {new Date(facture.date_creation).toLocaleDateString('fr-FR')}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={1} alignItems="flex-end">
              <Chip label={facture.statut} color={statusColor} />
              {facture.validated_by_admin && (
                <Chip
                  icon={<CheckCircle />}
                  label="Validée"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        </Paper>

        {/* Client */}
        {client && (
          <Paper sx={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
            p: 3,
            mb: 3
          }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A853', mb: 2 }}>
              Client
            </Typography>
            <Typography sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
              {client.nom}
            </Typography>
            {client.email && <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{client.email}</Typography>}
            {client.tel && <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{client.tel}</Typography>}
          </Paper>
        )}

        {/* Articles */}
        <Paper sx={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 3,
          p: 3,
          mb: 3
        }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A853', mb: 2 }}>
            Articles
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { color: 'rgba(255,255,255,0.6)', fontWeight: 700, borderColor: 'rgba(255,255,255,0.08)' } }}>
                <TableCell>Désignation</TableCell>
                <TableCell align="center">Qté</TableCell>
                <TableCell align="right">Prix Unit.</TableCell>
                <TableCell align="right">Total HT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(facture.articles || []).map((item, i) => {
                const qty = parseFloat(item.quantite) || 0;
                const pu = parseFloat(item.prix_unitaire) || 0;
                const rem = parseFloat(item.remise) || 0;
                const tot = qty * pu * (1 - rem / 100);
                return (
                  <TableRow key={i} sx={{ '& td': { color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.05)' } }}>
                    <TableCell>{item.designation || item.description}</TableCell>
                    <TableCell align="center">{qty}</TableCell>
                    <TableCell align="right">{formatMoney(pu, devise)}</TableCell>
                    <TableCell align="right" fontWeight={600}>{formatMoney(tot, devise)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>

        {/* Totaux */}
        <Paper sx={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 3,
          p: 3,
          mb: 3
        }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A853', mb: 2 }}>
            Récapitulatif
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Total HT</Typography>
              <Typography sx={{ color: '#fff', fontWeight: 600 }}>{formatMoney(facture.total_ht, devise)}</Typography>
            </Box>
            {facture.remise_globale > 0 && (
              <>
                <Box display="flex" justifyContent="space-between">
                  <Typography sx={{ color: '#ef4444' }}>Remise ({facture.remise_globale}%)</Typography>
                  <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>-{formatMoney(facture.remise_montant, devise)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Après remise</Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>{formatMoney(facture.total_apres_remise, devise)}</Typography>
                </Box>
              </>
            )}
            <Box display="flex" justifyContent="space-between">
              <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>TVA</Typography>
              <Typography sx={{ color: '#fff', fontWeight: 600 }}>{formatMoney(facture.tva, devise)}</Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>Total TTC</Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#D4A853' }}>
                {formatMoney(facture.total_ttc, devise)}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Bouton téléchargement */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={pdfLoading ? <CircularProgress size={20} sx={{ color: '#080807' }} /> : <GetApp />}
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          sx={{
            background: 'linear-gradient(135deg,#D4A853,#F4D03F)',
            color: '#080807',
            fontWeight: 700,
            py: 1.5,
            fontSize: '1.1rem'
          }}
        >
          {pdfLoading ? 'Génération...' : 'Télécharger le PDF'}
        </Button>
      </Container>
    </Box>
  );
};
