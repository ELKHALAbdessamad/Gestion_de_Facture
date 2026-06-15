import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, Grid,
  Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Divider, Tooltip, CircularProgress
} from '@mui/material';
import {
  ArrowBack, GetApp, Edit, CheckCircle, Delete, Draw, Email
} from '@mui/icons-material';
import { getFactureById, getClients, updateFacture, deleteFacture } from '../services/firebaseService';
import { getArticles, getParametres } from '../services/jsonService';
import { downloadFacturePDF } from '../utils/pdfGenerator';
import { SignatureModal } from '../components/SignatureModal';
import { notify } from '../services/notificationService';
import { sendFactureByEmail } from '../services/emailService';
import { formatMoney } from '../utils/currency';
import { useAuth } from '../contexts/AuthContext';

export const FactureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, currentUser } = useAuth();

  const [facture, setFacture] = useState(null);
  const [client, setClient] = useState(null);
  const [articles, setArticles] = useState([]);
  const [parametres, setParametres] = useState(null);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const loadData = useCallback(async () => {
    const [factureData, clientsData, articlesData, parametresData] = await Promise.all([
      getFactureById(id), getClients(), getArticles(), getParametres()
    ]);
    setFacture(factureData);
    setArticles(articlesData);
    setParametres(parametresData);
    if (factureData) {
      setClient(clientsData.find(c => c.id === factureData.client_id) || null);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDownloadPDF = async () => {
    if (!facture || !client) {
      notify.error('Données manquantes pour générer le PDF');
      return;
    }
    setPdfLoading(true);
    try {
      await downloadFacturePDF(facture, client, articles, parametres, signatureDataUrl);
      notify.pdfGenere(facture.numero);
    } catch (e) {
      notify.error('Erreur lors de la génération du PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!isAdmin) return;
    await updateFacture(id, {
      validated_by_admin: true,
      validated_by: currentUser?.email || 'admin',
      validated_at: new Date().toISOString(),
    });
    notify.factureValidee(facture.numero);
    loadData();

    if (client?.email) {
      try {
        sendFactureByEmail(facture, client, parametres);
        notify.emailEnvoye(client.email);
      } catch {
        notify.warning('Facture validée — email client non disponible');
      }
    }
  };

  const handleSendEmail = () => {
    if (!client?.email) {
      notify.error('Ce client n\'a pas d\'adresse email');
      return;
    }
    try {
      sendFactureByEmail(facture, client, parametres);
      notify.emailEnvoye(client.email);
    } catch (err) {
      notify.error(err.message || 'Impossible d\'envoyer l\'email');
    }
  };

  const handleStatusChange = async (newStatut) => {
    await updateFacture(id, { statut: newStatut });
    if (newStatut === 'Payée')   notify.facturePayee(facture.numero);
    if (newStatut === 'Rejetée') notify.factureRejetee(facture.numero);
    loadData();
  };

  const handleDelete = async () => {
    if (!isAdmin) return;
    if (window.confirm('Supprimer cette facture définitivement ?')) {
      await deleteFacture(id);
      notify.factureSupprimee(facture.numero);
      navigate('/factures');
    }
  };

  const statusColor = (s) => {
    if (s === 'Payée')      return 'success';
    if (s === 'En attente') return 'warning';
    if (s === 'Rejetée')    return 'error';
    return 'default';
  };

  const cardSx = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 3, p: 3,
  };

  if (!facture) return (
    <Box display="flex" justifyContent="center" mt={8}>
      <CircularProgress sx={{ color: '#D4A853' }} />
    </Box>
  );

  const devise = parametres?.devise || 'MAD';

  return (
    <Box>
      {/* ── Barre d'actions ── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/factures')}
          sx={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Retour
        </Button>

        <Box display="flex" gap={1} flexWrap="wrap">
          {/* Signature */}
          <Tooltip title={signatureDataUrl ? 'Signature ajoutée ✓' : 'Ajouter une signature'}>
            <Button
              variant="outlined"
              startIcon={<Draw />}
              onClick={() => setSignatureOpen(true)}
              sx={{
                borderColor: signatureDataUrl ? '#4ade80' : 'rgba(212,168,83,0.5)',
                color: signatureDataUrl ? '#4ade80' : '#D4A853',
              }}
            >
              {signatureDataUrl ? 'Signature ✓' : 'Signer'}
            </Button>
          </Tooltip>

          {/* Valider (admin) */}
          {isAdmin && !facture.validated_by_admin && (
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={handleValidate}
              sx={{ background: 'linear-gradient(135deg,#4ade80,#22c55e)', color: '#fff' }}
            >
              Valider
            </Button>
          )}

          {/* Changer statut */}
          {facture.statut === 'En attente' && (
            <>
              <Button
                variant="outlined"
                onClick={() => handleStatusChange('Payée')}
                sx={{ borderColor: '#4ade80', color: '#4ade80' }}
              >
                Marquer Payée
              </Button>
              {isAdmin && (
                <Button
                  variant="outlined"
                  onClick={() => handleStatusChange('Rejetée')}
                  sx={{ borderColor: '#ef4444', color: '#ef4444' }}
                >
                  Rejeter
                </Button>
              )}
            </>
          )}

          {/* Modifier */}
          <Button
            startIcon={<Edit />}
            variant="outlined"
            onClick={() => navigate(`/factures/edit/${id}`)}
            sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            Modifier
          </Button>

          {/* Email client */}
          {client?.email && (
            <Button
              variant="outlined"
              startIcon={<Email />}
              onClick={handleSendEmail}
              sx={{ borderColor: '#60a5fa', color: '#60a5fa' }}
            >
              Envoyer par Email
            </Button>
          )}

          {/* PDF */}
          <Button
            variant="contained"
            startIcon={pdfLoading ? <CircularProgress size={16} sx={{ color: '#080807' }} /> : <GetApp />}
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            sx={{
              background: 'linear-gradient(135deg,#D4A853,#F4D03F)',
              color: '#080807', fontWeight: 700,
            }}
          >
            {pdfLoading ? 'Génération...' : 'Télécharger PDF'}
          </Button>

          {/* Supprimer (admin) */}
          {isAdmin && (
            <Button
              variant="contained"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* ── En-tête facture ── */}
        <Grid item xs={12}>
          <Paper sx={cardSx}>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>
                Facture N° {facture.numero}
              </Typography>
              <Chip label={facture.statut} color={statusColor(facture.statut)} />
              {facture.validated_by_admin && (
                <Chip
                  icon={<CheckCircle />}
                  label={`Validée par ${facture.validated_by || 'admin'}`}
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* ── Infos facture ── */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardSx}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A853', mb: 2 }}>
              Informations Facture
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                <b>Date :</b> {new Date(facture.date_creation).toLocaleDateString('fr-FR')}
              </Typography>
              {facture.date_echeance && (
                <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <b>Échéance :</b> {new Date(facture.date_echeance).toLocaleDateString('fr-FR')}
                </Typography>
              )}
              {facture.mode_paiement && (
                <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <b>Mode paiement :</b> {facture.mode_paiement}
                </Typography>
              )}
              {facture.type_virement && (
                <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <b>Type virement :</b> {facture.type_virement}
                </Typography>
              )}
              {facture.date_depot && (
                <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <b>Date dépôt :</b> {new Date(facture.date_depot).toLocaleDateString('fr-FR')}
                </Typography>
              )}
              {facture.date_encaissement && (
                <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <b>Date encaissement :</b> {new Date(facture.date_encaissement).toLocaleDateString('fr-FR')}
                </Typography>
              )}
              {facture.validated_at && (
                <Typography sx={{ color: '#4ade80' }}>
                  <b>Validée le :</b> {new Date(facture.validated_at).toLocaleDateString('fr-FR')}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* ── Client ── */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardSx}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A853', mb: 2 }}>
              Client
            </Typography>
            {client ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                  {client.nom}
                </Typography>
                {client.email && (
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{client.email}</Typography>
                )}
                {client.tel && (
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{client.tel}</Typography>
                )}
                {client.adresse && (
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{client.adresse}</Typography>
                )}
              </Box>
            ) : (
              <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>Client non trouvé</Typography>
            )}
          </Paper>
        </Grid>

        {/* ── Tableau articles ── */}
        <Grid item xs={12}>
          <Paper sx={cardSx}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A853', mb: 2 }}>
              Articles
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: 'rgba(255,255,255,0.6)', fontWeight: 700, borderColor: 'rgba(255,255,255,0.08)' } }}>
                  <TableCell>Désignation</TableCell>
                  <TableCell align="center">Qté</TableCell>
                  <TableCell align="right">Prix Unit.</TableCell>
                  <TableCell align="center">Remise</TableCell>
                  <TableCell align="center">TVA</TableCell>
                  <TableCell align="right">Total HT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(facture.articles || []).length > 0 ? (
                  (facture.articles || []).map((item, i) => {
                    const qty = parseFloat(item.quantite || item.quantity) || 0;
                    const pu  = parseFloat(item.prix_unitaire || item.rate) || 0;
                    const rem = parseFloat(item.remise) || 0;
                    const tot = qty * pu * (1 - rem / 100);
                    return (
                      <TableRow key={i} sx={{ '& td': { color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.05)' } }}>
                        <TableCell>{item.designation || item.description || '-'}</TableCell>
                        <TableCell align="center">{qty}</TableCell>
                        <TableCell align="right">{formatMoney(pu, devise)}</TableCell>
                        <TableCell align="center" sx={{ color: rem > 0 ? '#ef4444' : 'inherit' }}>
                          {rem > 0 ? `${rem}%` : '—'}
                        </TableCell>
                        <TableCell align="center">{item.tva || 20}%</TableCell>
                        <TableCell align="right" fontWeight={600}>
                          {formatMoney(tot, devise)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                      Aucun article
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* ── Totaux ── */}
        <Grid item xs={12} md={5} sx={{ ml: 'auto' }}>
          <Paper sx={cardSx}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A853', mb: 2 }}>
              Récapitulatif
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Total HT</Typography>
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                  {formatMoney(facture.total_ht, devise)}
                </Typography>
              </Box>
              {facture.remise_globale > 0 && (
                <>
                  <Box display="flex" justifyContent="space-between">
                    <Typography sx={{ color: '#ef4444' }}>
                      Remise globale ({facture.remise_globale}%)
                    </Typography>
                    <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>
                      -{formatMoney(facture.remise_montant, devise)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Après remise</Typography>
                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                      {formatMoney(facture.total_apres_remise, devise)}
                    </Typography>
                  </Box>
                </>
              )}
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>TVA</Typography>
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                  {formatMoney(facture.tva, devise)}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
                  Total TTC
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#D4A853' }}>
                  {formatMoney(facture.total_ttc, devise)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* ── Aperçu signature ── */}
        {signatureDataUrl && (
          <Grid item xs={12} md={4}>
            <Paper sx={cardSx}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A853', mb: 2 }}>
                Signature numérique
              </Typography>
              <Box
                sx={{
                  border: '1px solid rgba(212,168,83,0.3)',
                  borderRadius: 2, p: 1, background: 'rgba(255,255,255,0.05)',
                }}
              >
                <img src={signatureDataUrl} alt="Signature" style={{ maxWidth: '100%', maxHeight: 80 }} />
              </Box>
              <Button
                size="small"
                onClick={() => setSignatureDataUrl(null)}
                sx={{ mt: 1, color: '#ef4444' }}
              >
                Supprimer la signature
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* ── Modal Signature ── */}
      <SignatureModal
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        onSave={(dataUrl) => {
          setSignatureDataUrl(dataUrl);
          notify.success('Signature ajoutée — sera incluse dans le PDF');
        }}
      />
    </Box>
  );
};
