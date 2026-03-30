import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton
} from '@mui/material';
import { Add, Visibility, GetApp, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getFactures } from '../services/firebaseService';
import { getClients } from '../services/firebaseService';
import { getArticles, getParametres } from '../services/jsonService';
import { downloadFacturePDF } from '../utils/pdfGenerator';
import { LordIcon, Icons } from '../components/LordIcon';

export const Factures = () => {
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [parametres, setParametres] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [facturesData, clientsData, articlesData, parametresData] = await Promise.all([
      getFactures(),
      getClients(),
      getArticles(),
      getParametres()
    ]);
    setFactures(facturesData);
    setClients(clientsData);
    setArticles(articlesData);
    setParametres(parametresData);
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.nom : 'Client inconnu';
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'Payée': return 'success';
      case 'En attente': return 'warning';
      case 'Rejetée': return 'error';
      default: return 'default';
    }
  };

  const handleDownloadPDF = (facture) => {
    const client = clients.find(c => c.id === facture.client_id);
    if (client && parametres) {
      downloadFacturePDF(facture, client, articles, parametres);
    }
  };

  return (
    <Box className="fade-in-up">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <LordIcon 
            src={Icons.invoice}
            trigger="loop"
            size={48}
            colors="primary:#D4A853"
          />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
            Gestion des Factures
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/factures/nouvelle')}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 700
          }}
        >
          Nouvelle Facture
        </Button>
      </Box>

      <TableContainer component={Paper} className="bento-card" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: 1 }}>Numéro</TableCell>
              <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: 1 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: 1 }}>Client</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: 1 }}>Total TTC</TableCell>
              <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: 1 }}>Statut</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: 1 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {factures.map((facture) => (
              <TableRow 
                key={facture.id}
                sx={{
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.03)'
                  }
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{facture.numero}</TableCell>
                <TableCell>
                  {new Date(facture.date_creation).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>{getClientName(facture.client_id)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{facture.total_ttc?.toFixed(2)} €</TableCell>
                <TableCell>
                  <Chip
                    label={facture.statut}
                    color={getStatusColor(facture.statut)}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => navigate(`/factures/${facture.id}`)}
                    sx={{ 
                      color: '#D4A853',
                      '&:hover': { background: 'rgba(212, 168, 83, 0.1)' }
                    }}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={() => navigate(`/factures/edit/${facture.id}`)}
                    sx={{ 
                      color: '#60a5fa',
                      '&:hover': { background: 'rgba(96, 165, 250, 0.1)' }
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDownloadPDF(facture)}
                    sx={{ 
                      color: '#4ade80',
                      '&:hover': { background: 'rgba(74, 222, 128, 0.1)' }
                    }}
                  >
                    <GetApp />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
