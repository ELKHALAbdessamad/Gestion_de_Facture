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
import { getFactureById, getClients, updateFacture, deleteFacture } from '../services/mongodbService';
import { getArticles, getParametres } from '../services/mongodbService';
import { downloadFacturePDF } from '../utils/pdfGenerator';
import { SignatureModal } from '../components/SignatureModal';
import { notify } from '../services/notificationService';
import { sendFactureByEmail } from '../services/emailService';
import { formatMoney } from '../utils/currency';
import { useAuth } from '../contexts/AuthContextMongoDB';
import { useLanguage } from '../contexts/LanguageContext';

export const FactureDetail = () => {
  const { t, language } = useLanguage();
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
      // client_id peut être un objet populé ou un string ObjectId
      const cid = factureData.client_id;
      if (cid && typeof cid === 'object' && cid.nom) {
        setClient(cid);
      } else {
        setClient(clientsData.find(c => String(c.id) === String(cid) || String(c._id) === String(cid)) || null);
      }
    }
  }, [id]);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  // Restaurer la signature depuis la DB
  useEffect(() => {
    if (facture && facture.signature) {
      setSignatureDataUrl(facture.signature);
    }
  }, [facture]);

  const handleDownloadPDF = async () => {
    if (!facture) {
      notify.error('Données manquantes pour générer le PDF');
      return;
    }
    setPdfLoading(true);
    try {
      // Ajouter l'ID à la facture pour le QR code
      const factureWithId = { ...facture, id };
      await downloadFacturePDF(factureWithId, client, articles, parametres, signatureDataUrl, language);
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
        const result = await sendFactureByEmail(facture, client, parametres);
        if (result.method === 'mailto') {
          notify.emailMailto(client.email);
        } else {
          notify.emailEnvoye(client.email);
        }
      } catch {
        notify.warning('Facture validée — email client non disponible');
      }
    }
  };

  const handleSendEmail = async () => {
    if (!client?.email) {
      notify.error('Ce client n\'a pas d\'adresse email');
      return;
    }
    try {
      const result = await sendFactureByEmail(facture, client, parametres);
      if (result.method === 'mailto') {
        notify.emailMailto(client.email);
      } else {
        notify.emailEnvoye(client.email);
      }
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
          {t('invoiceDetail.buttons.back')}
        </Button>

        <Box display="flex" gap={1} flexWrap="wrap">
          {/* Signature */}
          <Tooltip title={signatureDataUrl ? t('invoiceDetail.buttons.signed') : 'Ajouter une signature'}>
            <Button
              variant="outlined"
              startIcon={<Draw />}
              onClick={() => setSignatureOpen(true)}
              sx={{
                borderColor: signatureDataUrl ? '#4ade80' : 'rgba(212,168,83,0.5)',
                color: signatureDataUrl ? '#4ade80' : '#D4A853',
              }}
            >
              {signatureDataUrl ? t('invoiceDetail.buttons.signed') : t('invoiceDetail.buttons.sign')}
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
              {t('invoiceDetail.buttons.validate')}
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
                {t('invoiceDetail.buttons.markPaid')}
              </Button>
              {isAdmin && (
                <Button
                  variant="outlined"
                  onClick={() => handleStatusChange('Rejetée')}
                  sx={{ borderColor: '#ef4444', color: '#ef4444' }}
                >
                  {t('invoiceDetail.buttons.reject')}
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
            {t('invoiceDetail.buttons.edit')}
          </Button>

          {/* Email client */}
          <Button
            variant="outlined"
            startIcon={<Email />}
            onClick={handleSendEmail}
            disabled={!client?.email}
            sx={{ borderColor: '#60a5fa', color: '#60a5fa', opacity: !client?.email ? 0.4 : 1 }}
          >
            {t('invoiceDetail.buttons.sendEmail')}
          </Button>

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
            {pdfLoading ? t('invoiceDetail.buttons.generating') : t('invoiceDetail.buttons.downloadPDF')}
          </Button>

          {/* Supprimer (admin) */}
          {isAdmin && (
            <Button
              variant="contained"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
            >
              {t('invoiceDetail.buttons.delete')}
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
                {t('invoiceDetail.title')} {facture.numero}
              </Typography>
              <Chip label={facture.statut} color={statusColor(facture.statut)} />

            </Box>
          </Paper>
        </Grid>

        {/* ── Infos facture ── */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardSx}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A853', mb: 2 }}>
              {t('invoiceDetail.sections.invoiceInfo')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                <b>{t('invoiceDetail.fields.date')} :</b> {new Date(facture.date_creation).toLocaleDateString('fr-FR')}
              </Typography>
              {facture.date_echeance && (
                <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <b>{t('invoiceDetail.fields.dueDate')} :</b> {new Date(facture.date_echeance).toLocaleDateString('fr-FR')}
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
              {t('invoiceDetail.sections.client')}
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
              <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>{t('invoiceDetail.messages.clientNotFound')}</Typography>
            )}
          </Paper>
        </Grid>

        {/* ── Tableau articles ── */}
        <Grid item xs={12}>
          <Paper sx={cardSx}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A853', mb: 2 }}>
              {t('invoiceDetail.sections.articles')}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: 'rgba(255,255,255,0.6)', fontWeight: 700, borderColor: 'rgba(255,255,255,0.08)' } }}>
                  <TableCell>{t('invoiceDetail.fields.designation')}</TableCell>
                  <TableCell align="center">{t('invoiceDetail.fields.quantity')}</TableCell>
                  <TableCell align="right">{t('invoiceDetail.fields.unitPrice')}</TableCell>
                  <TableCell align="center">{t('invoiceDetail.fields.discount')}</TableCell>
                  <TableCell align="center">{t('invoiceDetail.fields.vat')}</TableCell>
                  <TableCell align="right">{t('invoiceDetail.fields.totalHT')}</TableCell>
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
                      {t('invoiceDetail.messages.noArticles')}
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
              {t('invoiceDetail.sections.summary')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{t('invoiceDetail.fields.totalHT')}</Typography>
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                  {formatMoney(facture.total_ht, devise)}
                </Typography>
              </Box>
              {facture.remise_globale > 0 && (
                <>
                  <Box display="flex" justifyContent="space-between">
                    <Typography sx={{ color: '#ef4444' }}>
                      {t('invoiceDetail.fields.globalDiscount')} ({facture.remise_globale}%)
                    </Typography>
                    <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>
                      -{formatMoney(facture.remise_montant, devise)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{t('invoiceDetail.fields.afterDiscount')}</Typography>
                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                      {formatMoney(facture.total_apres_remise, devise)}
                    </Typography>
                  </Box>
                </>
              )}
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>{t('invoiceDetail.fields.totalVAT')}</Typography>
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                  {formatMoney(facture.tva, devise)}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
                  {t('invoiceDetail.fields.totalTTC')}
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

        {/* ── Lien public QR Code ── */}
        <Grid item xs={12}>
          <Paper sx={cardSx}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A853', mb: 2 }}>
              Accès public via QR Code
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, fontSize: '0.9rem' }}>
              Scannez le QR code sur le PDF pour accéder à cette facture depuis un téléphone et la télécharger.
            </Typography>
            <Box
              sx={{
                background: 'rgba(212,168,83,0.1)',
                border: '1px solid rgba(212,168,83,0.3)',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              <Typography sx={{ color: '#D4A853', fontFamily: 'monospace', fontSize: '0.85rem', flex: 1 }}>
                {window.location.origin}/facture/{id}
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/facture/${id}`);
                  notify.success('Lien copié !');
                }}
                sx={{ color: '#D4A853', borderColor: '#D4A853' }}
                variant="outlined"
              >
                Copier le lien
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Modal Signature ── */}
      <SignatureModal
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        onSave={async (dataUrl) => {
          setSignatureDataUrl(dataUrl);
          // Sauvegarder la signature dans la DB
          try {
            await updateFacture(id, { signature: dataUrl });
            notify.success('Signature sauvegardée dans la facture');
          } catch (e) {
            notify.success('Signature ajoutée — sera incluse dans le PDF');
          }
        }}
      />
    </Box>
  );
};
