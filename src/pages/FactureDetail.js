import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Divider
} from '@mui/material';
import { ArrowBack, GetApp, Edit } from '@mui/icons-material';
import { getFactureById, getClients } from '../services/firebaseService';
import { getArticles, getParametres } from '../services/jsonService';
import { downloadFacturePDF } from '../utils/pdfGenerator';

export const FactureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facture, setFacture] = useState(null);
  const [client, setClient] = useState(null);
  const [articles, setArticles] = useState([]);
  const [parametres, setParametres] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const [factureData, clientsData, articlesData, parametresData] = await Promise.all([
      getFactureById(id),
      getClients(),
      getArticles(),
      getParametres()
    ]);
    
    setFacture(factureData);
    setArticles(articlesData);
    setParametres(parametresData);
    
    if (factureData) {
      const clientData = clientsData.find(c => c.id === factureData.client_id);
      setClient(clientData);
    }
  };

  const handleDownloadPDF = () => {
    if (facture && client && parametres && facture.articles && facture.articles.length > 0) {
      downloadFacturePDF(facture, client, articles, parametres);
    } else {
      alert('Impossible de générer le PDF : données manquantes');
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'Payée': return 'success';
      case 'En attente': return 'warning';
      case 'Rejetée': return 'error';
      default: return 'default';
    }
  };

  if (!facture) return <Typography>Chargement...</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/factures')}>
          Retour
        </Button>
        <Box>
          <Button
            startIcon={<Edit />}
            onClick={() => navigate(`/factures/edit/${id}`)}
            sx={{ mr: 1 }}
          >
            Modifier
          </Button>
          <Button
            variant="contained"
            startIcon={<GetApp />}
            onClick={handleDownloadPDF}
          >
            Télécharger PDF
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4">Facture N° {facture.numero}</Typography>
            <Chip
              label={facture.statut}
              color={getStatusColor(facture.statut)}
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Informations Facture</Typography>
            <Typography>Date: {new Date(facture.date_creation).toLocaleDateString('fr-FR')}</Typography>
            {facture.date_depot && (
              <Typography>Date de dépôt: {new Date(facture.date_depot).toLocaleDateString('fr-FR')}</Typography>
            )}
            {facture.date_encaissement && (
              <Typography>Date d'encaissement: {new Date(facture.date_encaissement).toLocaleDateString('fr-FR')}</Typography>
            )}
            {facture.type_virement && (
              <Typography>Type de virement: {facture.type_virement}</Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Client</Typography>
            {client && (
              <>
                <Typography>{client.nom}</Typography>
                <Typography>{client.email}</Typography>
                <Typography>{client.tel}</Typography>
                <Typography>{client.adresse}</Typography>
              </>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Articles</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Désignation</TableCell>
                  <TableCell align="right">Quantité</TableCell>
                  <TableCell align="right">Prix Unitaire</TableCell>
                  <TableCell align="right">TVA</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facture.articles && facture.articles.length > 0 ? (
                  facture.articles.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.designation}</TableCell>
                      <TableCell align="right">{item.quantite}</TableCell>
                      <TableCell align="right">{item.prix_unitaire?.toFixed(2) || '0.00'} €</TableCell>
                      <TableCell align="right">{item.tva}%</TableCell>
                      <TableCell align="right">
                        {((item.quantite || 0) * (item.prix_unitaire || 0)).toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">Aucun article</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ textAlign: 'right', mt: 2 }}>
              <Typography variant="h6">Total HT: {facture.total_ht?.toFixed(2)} €</Typography>
              <Typography variant="h6">TVA: {facture.tva?.toFixed(2)} €</Typography>
              <Typography variant="h5" color="primary">
                Total TTC: {facture.total_ttc?.toFixed(2)} €
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
