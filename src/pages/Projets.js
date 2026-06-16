import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Typography, Paper, Grid, Button, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Select, MenuItem, FormControl, InputLabel,
  LinearProgress, Tooltip, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, Work, MonetizationOn,
  Schedule, CheckCircle, TrendingUp, ArrowBack, Close,
  Business, AttachMoney, CalendarToday, Label
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  getProjets, addProjet, updateProjet, deleteProjet, getProjetById, getClients
} from '../services/mongodbService';
import { formatMoney } from '../utils/currency';
import { notify } from '../services/notificationService';
import { AnimatedCard } from '../components/AnimatedCard';

const STATUTS = ['En cours', 'Terminé', 'En pause', 'Annulé'];
const PRIORITES = ['Faible', 'Normale', 'Haute', 'Urgente'];

const statutColor = (s) => {
  if (s === 'Terminé') return '#4ade80';
  if (s === 'En cours') return '#D4A853';
  if (s === 'En pause') return '#fbbf24';
  if (s === 'Annulé') return '#ef4444';
  return '#6b7280';
};

const prioriteColor = (p) => {
  if (p === 'Urgente') return '#ef4444';
  if (p === 'Haute') return '#f97316';
  if (p === 'Normale') return '#60a5fa';
  return '#6b7280';
};

const inputSx = {
  mb: 2,
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    '& fieldset': { border: 'none' },
    '&:hover': { background: 'rgba(255,255,255,0.05)' },
    '&.Mui-focused': { border: '1px solid rgba(212,168,83,0.5)' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
  '& input, & textarea': { color: '#fff' },
};

const validationSchema = Yup.object({
  nom: Yup.string().required('Le nom du projet est requis'),
  budget: Yup.number().min(0, 'Le budget doit être positif'),
  date_debut: Yup.string().required('Date de début requise'),
});

export const Projets = () => {
  const navigate = useNavigate();
  const [projets, setProjets] = useState([]);
  const [clients, setClients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProjet, setEditingProjet] = useState(null);
  const [detailProjet, setDetailProjet] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [filterStatut, setFilterStatut] = useState('Tous');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [projetsData, clientsData] = await Promise.all([
      getProjets().catch(() => []),
      getClients().catch(() => [])
    ]);
    setProjets(projetsData);
    setClients(clientsData);
  };

  const formik = useFormik({
    initialValues: {
      nom: '',
      description: '',
      client_id: '',
      statut: 'En cours',
      priorite: 'Normale',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin_prevue: '',
      budget: 0,
      devise: 'MAD',
      notes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingProjet) {
          await updateProjet(editingProjet.id, values);
          notify.success(`Projet "${values.nom}" mis à jour`);
        } else {
          await addProjet(values);
          notify.success(`Projet "${values.nom}" créé avec succès`);
        }
        handleCloseDialog();
        loadData();
      } catch (err) {
        notify.error('Erreur lors de la sauvegarde du projet');
      }
    },
  });

  const handleOpenCreate = () => {
    setEditingProjet(null);
    formik.resetForm();
    setOpenDialog(true);
  };

  const handleOpenEdit = (projet) => {
    setEditingProjet(projet);
    formik.setValues({
      nom: projet.nom || '',
      description: projet.description || '',
      client_id: projet.client_id?.id || projet.client_id || '',
      statut: projet.statut || 'En cours',
      priorite: projet.priorite || 'Normale',
      date_debut: projet.date_debut ? new Date(projet.date_debut).toISOString().split('T')[0] : '',
      date_fin_prevue: projet.date_fin_prevue ? new Date(projet.date_fin_prevue).toISOString().split('T')[0] : '',
      budget: projet.budget || 0,
      devise: projet.devise || 'MAD',
      notes: projet.notes || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProjet(null);
    formik.resetForm();
  };

  const handleDelete = async (projet) => {
    if (window.confirm(`Supprimer le projet "${projet.nom}" ?`)) {
      await deleteProjet(projet.id);
      notify.success(`Projet "${projet.nom}" supprimé`);
      loadData();
    }
  };

  const handleViewDetail = async (projet) => {
    try {
      const detail = await getProjetById(projet.id);
      setDetailProjet(detail);
      setOpenDetail(true);
    } catch (err) {
      setDetailProjet(projet);
      setOpenDetail(true);
    }
  };

  const getClientName = (clientId) => {
    if (typeof clientId === 'object' && clientId?.nom) return clientId.nom;
    const client = clients.find(c => c.id === clientId || c._id === clientId);
    return client ? client.nom : '';
  };

  const filteredProjets = projets.filter(p =>
    filterStatut === 'Tous' || p.statut === filterStatut
  );

  // KPIs globaux
  const totalBudget = projets.reduce((s, p) => s + (p.budget || 0), 0);
  const projetsEnCours = projets.filter(p => p.statut === 'En cours').length;
  const projetsTermines = projets.filter(p => p.statut === 'Terminé').length;

  return (
    <Box>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>
              🚀 Gestion de Projets
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              Suivi entrepreneurial — {projets.length} projet{projets.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            Nouveau Projet
          </Button>
        </Box>
      </motion.div>

      {/* KPI Summary */}
      <Grid container spacing={3} mb={4}>
        {[
          { label: 'Total Projets', value: projets.length, color: '#D4A853', icon: Work },
          { label: 'En cours', value: projetsEnCours, color: '#60a5fa', icon: TrendingUp },
          { label: 'Terminés', value: projetsTermines, color: '#4ade80', icon: CheckCircle },
          { label: 'Budget Total', value: formatMoney(totalBudget, 'MAD'), color: '#a78bfa', icon: AttachMoney },
        ].map((kpi, i) => (
          <Grid item xs={6} sm={3} key={kpi.label}>
            <AnimatedCard delay={i * 100}>
              <Paper sx={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 3, p: 2.5, textAlign: 'center'
              }}>
                <Box sx={{
                  width: 44, height: 44, borderRadius: 2, mx: 'auto', mb: 1,
                  background: `${kpi.color}20`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <kpi.icon sx={{ color: kpi.color, fontSize: 22 }} />
                </Box>
                <Typography variant="h5" fontWeight={800} sx={{ color: kpi.color }}>
                  {kpi.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {kpi.label}
                </Typography>
              </Paper>
            </AnimatedCard>
          </Grid>
        ))}
      </Grid>

      {/* Filter */}
      <Box display="flex" gap={1} mb={3} flexWrap="wrap">
        {['Tous', ...STATUTS].map(s => (
          <Chip
            key={s}
            label={s}
            onClick={() => setFilterStatut(s)}
            sx={{
              cursor: 'pointer',
              background: filterStatut === s ? (s === 'Tous' ? '#D4A853' : statutColor(s)) : 'rgba(255,255,255,0.05)',
              color: filterStatut === s ? (s === 'Tous' ? '#080807' : '#fff') : 'rgba(255,255,255,0.6)',
              fontWeight: 600,
              border: filterStatut === s ? 'none' : '1px solid rgba(255,255,255,0.1)',
              '&:hover': { opacity: 0.9 }
            }}
          />
        ))}
      </Box>

      {/* Projets Grid */}
      <Grid container spacing={3}>
        {filteredProjets.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, p: 6, textAlign: 'center' }}>
              <Work sx={{ fontSize: 64, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Aucun projet trouvé
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', mt: 1 }}>
                Créez votre premier projet entrepreneurial
              </Typography>
            </Paper>
          </Grid>
        ) : (
          filteredProjets.map((projet, i) => (
            <Grid item xs={12} md={6} lg={4} key={projet.id || i}>
              <AnimatedCard delay={i * 80}>
                <Paper sx={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${statutColor(projet.statut)}30`,
                  borderRadius: 3, p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: `1px solid ${statutColor(projet.statut)}60`,
                    background: 'rgba(255,255,255,0.05)',
                    transform: 'translateY(-2px)',
                  }
                }}>
                  {/* Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', mb: 0.5 }}>
                        {projet.nom}
                      </Typography>
                      {getClientName(projet.client_id) && (
                        <Typography variant="caption" sx={{ color: '#D4A853', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Business sx={{ fontSize: 12 }} />
                          {getClientName(projet.client_id)}
                        </Typography>
                      )}
                    </Box>
                    <Box display="flex" flexDirection="column" gap={0.5} alignItems="flex-end">
                      <Chip
                        label={projet.statut}
                        size="small"
                        sx={{
                          background: `${statutColor(projet.statut)}20`,
                          color: statutColor(projet.statut),
                          border: `1px solid ${statutColor(projet.statut)}40`,
                          fontWeight: 700, fontSize: '0.7rem'
                        }}
                      />
                      <Chip
                        label={projet.priorite || 'Normale'}
                        size="small"
                        sx={{
                          background: `${prioriteColor(projet.priorite)}15`,
                          color: prioriteColor(projet.priorite),
                          border: `1px solid ${prioriteColor(projet.priorite)}30`,
                          fontSize: '0.65rem', height: 20
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Description */}
                  {projet.description && (
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2, fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {projet.description.length > 100 ? projet.description.slice(0, 100) + '...' : projet.description}
                    </Typography>
                  )}

                  {/* Budget */}
                  {projet.budget > 0 && (
                    <Box sx={{
                      background: 'rgba(167,139,250,0.1)',
                      border: '1px solid rgba(167,139,250,0.2)',
                      borderRadius: 2, p: 1.5, mb: 2
                    }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>
                        Budget
                      </Typography>
                      <Typography variant="h6" fontWeight={800} sx={{ color: '#a78bfa' }}>
                        {formatMoney(projet.budget, projet.devise || 'MAD')}
                      </Typography>
                    </Box>
                  )}

                  {/* Dates */}
                  <Box display="flex" gap={2} mb={2}>
                    {projet.date_debut && (
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>Début</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                          {new Date(projet.date_debut).toLocaleDateString('fr-FR')}
                        </Typography>
                      </Box>
                    )}
                    {projet.date_fin_prevue && (
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>Fin prévue</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                          {new Date(projet.date_fin_prevue).toLocaleDateString('fr-FR')}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box display="flex" gap={1} justifyContent="flex-end">
                    <Tooltip title="Voir détails">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetail(projet)}
                        sx={{ color: '#D4A853', '&:hover': { background: 'rgba(212,168,83,0.1)' } }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(projet)}
                        sx={{ color: '#60a5fa', '&:hover': { background: 'rgba(96,165,250,0.1)' } }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(projet)}
                        sx={{ color: '#ef4444', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </AnimatedCard>
            </Grid>
          ))
        )}
      </Grid>

      {/* Dialog Créer / Modifier */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: '#0f0f0e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingProjet ? '✏️ Modifier le projet' : '🚀 Nouveau Projet'}
          <IconButton onClick={handleCloseDialog} sx={{ color: 'rgba(255,255,255,0.5)' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom du projet *"
                  name="nom"
                  value={formik.values.nom}
                  onChange={formik.handleChange}
                  error={formik.touched.nom && Boolean(formik.errors.nom)}
                  helperText={formik.touched.nom && formik.errors.nom}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  multiline
                  rows={3}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel>Client</InputLabel>
                  <Select
                    name="client_id"
                    value={formik.values.client_id}
                    onChange={formik.handleChange}
                    label="Client"
                    sx={{ color: '#fff', '& .MuiSelect-icon': { color: '#D4A853' } }}
                  >
                    <MenuItem value="">Aucun</MenuItem>
                    {clients.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.nom}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    name="statut"
                    value={formik.values.statut}
                    onChange={formik.handleChange}
                    label="Statut"
                    sx={{ color: '#fff', '& .MuiSelect-icon': { color: '#D4A853' } }}
                  >
                    {STATUTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel>Priorité</InputLabel>
                  <Select
                    name="priorite"
                    value={formik.values.priorite}
                    onChange={formik.handleChange}
                    label="Priorité"
                    sx={{ color: '#fff', '& .MuiSelect-icon': { color: '#D4A853' } }}
                  >
                    {PRIORITES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Budget"
                  name="budget"
                  type="number"
                  value={formik.values.budget}
                  onChange={formik.handleChange}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date de début *"
                  name="date_debut"
                  type="date"
                  value={formik.values.date_debut}
                  onChange={formik.handleChange}
                  error={formik.touched.date_debut && Boolean(formik.errors.date_debut)}
                  helperText={formik.touched.date_debut && formik.errors.date_debut}
                  InputLabelProps={{ shrink: true }}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date de fin prévue"
                  name="date_fin_prevue"
                  type="date"
                  value={formik.values.date_fin_prevue}
                  onChange={formik.handleChange}
                  InputLabelProps={{ shrink: true }}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  multiline
                  rows={2}
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseDialog} sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ background: 'linear-gradient(135deg, #D4A853, #F4D03F)', color: '#080807', fontWeight: 700 }}
            >
              {editingProjet ? 'Mettre à jour' : 'Créer le projet'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog Détail */}
      <Dialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: '#0f0f0e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {detailProjet?.nom}
          <IconButton onClick={() => setOpenDetail(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {detailProjet && (
            <Box>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Statut</Typography>
                    <Chip
                      label={detailProjet.statut}
                      size="small"
                      sx={{
                        display: 'flex', mt: 0.5,
                        background: `${statutColor(detailProjet.statut)}20`,
                        color: statutColor(detailProjet.statut),
                        fontWeight: 700
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Budget</Typography>
                    <Typography variant="h6" fontWeight={800} sx={{ color: '#a78bfa', mt: 0.5 }}>
                      {formatMoney(detailProjet.budget, detailProjet.devise || 'MAD')}
                    </Typography>
                  </Box>
                </Grid>
                {detailProjet.kpis && (
                  <>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Factures</Typography>
                        <Typography variant="h6" fontWeight={800} sx={{ color: '#D4A853', mt: 0.5 }}>
                          {detailProjet.kpis.totalFactures}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Encaissé</Typography>
                        <Typography variant="h6" fontWeight={800} sx={{ color: '#4ade80', mt: 0.5 }}>
                          {formatMoney(detailProjet.kpis.totalEncaisse, detailProjet.devise || 'MAD')}
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>

              {/* Progression */}
              {detailProjet.kpis?.progression !== undefined && (
                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Avancement budgétaire</Typography>
                    <Typography variant="body2" sx={{ color: '#4ade80', fontWeight: 700 }}>{detailProjet.kpis.progression}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(detailProjet.kpis.progression, 100)}
                    sx={{
                      height: 8, borderRadius: 4,
                      background: 'rgba(255,255,255,0.05)',
                      '& .MuiLinearProgress-bar': { background: '#4ade80', borderRadius: 4 }
                    }}
                  />
                </Box>
              )}

              {/* Description */}
              {detailProjet.description && (
                <Box mb={3} sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                    {detailProjet.description}
                  </Typography>
                </Box>
              )}

              {/* Factures liées */}
              {detailProjet.factures?.length > 0 && (
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A853', mb: 2 }}>
                    Factures liées ({detailProjet.factures.length})
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['Numéro', 'Date', 'Montant TTC', 'Statut'].map(h => (
                            <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, borderColor: 'rgba(255,255,255,0.08)' }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailProjet.factures.map(f => (
                          <TableRow key={f.id} sx={{ '&:hover': { background: 'rgba(212,168,83,0.05)' } }}>
                            <TableCell sx={{ color: '#D4A853', fontWeight: 600, borderColor: 'rgba(255,255,255,0.05)' }}>{f.numero}</TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.05)' }}>
                              {f.date_creation ? new Date(f.date_creation).toLocaleDateString('fr-FR') : '—'}
                            </TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700, borderColor: 'rgba(255,255,255,0.05)' }}>
                              {formatMoney(f.total_ttc, 'MAD')}
                            </TableCell>
                            <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                              <Chip label={f.statut} size="small" sx={{
                                background: `${f.statut === 'Payée' ? '#4ade80' : f.statut === 'En attente' ? '#fbbf24' : '#ef4444'}20`,
                                color: f.statut === 'Payée' ? '#4ade80' : f.statut === 'En attente' ? '#fbbf24' : '#ef4444',
                                fontWeight: 600, fontSize: '0.7rem'
                              }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDetail(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>Fermer</Button>
          {detailProjet && (
            <Button
              variant="contained"
              onClick={() => { setOpenDetail(false); handleOpenEdit(detailProjet); }}
              sx={{ background: 'linear-gradient(135deg, #D4A853, #F4D03F)', color: '#080807', fontWeight: 700 }}
            >
              Modifier
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
