import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { GetApp } from '@mui/icons-material';
import axios from 'axios';
import { generateFacturePDF } from '../utils/pdfGenerator';

export const DownloadInvoice = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facture, setFacture] = useState(null);
  const [client, setClient] = useState(null);
  const [parametres, setParametres] = useState(null);

  useEffect(() => {
    loadInvoiceData();
  }, [id]);

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      // Charger les données de la facture (route publique)
      const response = await axios.get(`${API_URL}/factures/download/${id}`);
      
      setFacture(response.data.facture);
      setClient(response.data.client);
      setParametres(response.data.parametres);
      setError(null);
    } catch (err) {
      console.error('Erreur chargement facture:', err);
      setError('Facture introuvable ou expirée');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!facture) return;
    
    try {
      const factureWithId = { ...facture, id };
      const articles = [];
      const doc = await generateFacturePDF(
        factureWithId,
        client,
        articles,
        parametres,
        facture.signature,
        'fr'
      );
      doc.save(`Facture_${facture.numero}.pdf`);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      setError('Erreur lors de la génération du PDF');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #080807 0%, #1a1a1a 100%)',
        }}
      >
        <CircularProgress sx={{ color: '#D4A853' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #080807 0%, #1a1a1a 100%)',
          p: 3,
        }}
      >
        <Paper
          sx={{
            p: 4,
            maxWidth: 400,
            textAlign: 'center',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Typography variant="h5" sx={{ color: '#ef4444', mb: 2 }}>
            ❌ Erreur
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #080807 0%, #1a1a1a 100%)',
        p: 3,
      }}
    >
      <Paper
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            NovaFact
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Téléchargement de facture
          </Typography>
        </Box>

        {/* Info facture */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: '#fff', mb: 1 }}>
            Facture {facture?.numero}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
            Client : {client?.nom || 'N/A'}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Date : {facture?.date_creation ? new Date(facture.date_creation).toLocaleDateString('fr-FR') : 'N/A'}
          </Typography>
          <Typography variant="h6" sx={{ color: '#D4A853', mt: 2 }}>
            Total : {facture?.total_ttc?.toFixed(2)} {parametres?.devise || 'MAD'}
          </Typography>
        </Box>

        {/* Bouton télécharger */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<GetApp />}
          onClick={handleDownload}
          sx={{
            background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
            color: '#080807',
            fontWeight: 700,
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #F4D03F 0%, #D4A853 100%)',
            },
          }}
        >
          Télécharger le PDF
        </Button>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.4)',
            mt: 2,
          }}
        >
          Ce lien est valide et sécurisé
        </Typography>
      </Paper>
    </Box>
  );
};
