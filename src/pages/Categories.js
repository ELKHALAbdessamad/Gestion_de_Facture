import React, { useState, useEffect } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Chip
} from '@mui/material';
import { Add, Edit, Delete, Category } from '@mui/icons-material';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../services/jsonService';
import { notify } from '../services/notificationService';

// TVA → couleur badge
const tvaColor = (tva) => {
  if (tva === 0)  return { bg: 'rgba(74,222,128,0.15)',  color: '#4ade80',  border: 'rgba(74,222,128,0.3)' };
  if (tva === 10) return { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24',  border: 'rgba(251,191,36,0.3)' };
  return            { bg: 'rgba(212,168,83,0.15)',  color: '#D4A853',  border: 'rgba(212,168,83,0.3)' };
};

export const Categories = () => {
  const [categories, setCategories]   = useState([]);
  const [open, setOpen]               = useState(false);
  const [editingCategory, setEditing] = useState(null);
  const [formData, setFormData]       = useState({ nom: '', tva: 20 });

  useEffect(() => { load(); }, []);

  const load = async () => setCategories(await getCategories());

  const handleOpen = (cat = null) => {
    if (cat) { setEditing(cat); setFormData({ nom: cat.nom, tva: cat.tva }); }
    else     { setEditing(null); setFormData({ nom: '', tva: 20 }); }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditing(null); };

  const handleSubmit = async () => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, formData);
      notify.success(`Catégorie "${formData.nom}" modifiée`);
    } else {
      await addCategory(formData);
      notify.categorieCree(formData.nom);
    }
    handleClose();
    load();
  };

  const handleDelete = async (cat) => {
    if (window.confirm(`Supprimer la catégorie "${cat.nom}" ?`)) {
      await deleteCategory(cat.id);
      notify.success(`Catégorie "${cat.nom}" supprimée`);
      load();
    }
  };

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

  return (
    <Box className="fade-in-up">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Category sx={{ fontSize: 40, color: '#D4A853' }} />
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>
              Gestion des Catégories
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              TVA différenciée par catégorie — Informatique 20% · Services 10% · Formation 0%
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}
          sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 700 }}>
          Nouvelle Catégorie
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} className="bento-card" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              {['Nom de la Catégorie', 'Taux TVA', 'Nb Articles', 'Actions'].map(h => (
                <TableCell key={h}
                  align={h === 'Taux TVA' || h === 'Actions' ? 'right' : 'left'}
                  sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem',
                        letterSpacing: 1, color: 'rgba(255,255,255,0.6)' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'rgba(255,255,255,0.4)' }}>
                  Aucune catégorie
                </TableCell>
              </TableRow>
            ) : categories.map(cat => {
              const tc = tvaColor(cat.tva);
              return (
                <TableRow key={cat.id}
                  sx={{ '&:hover': { background: 'rgba(255,255,255,0.03)' } }}>
                  <TableCell sx={{ fontWeight: 600, color: '#fff' }}>{cat.nom}</TableCell>
                  <TableCell align="right">
                    <Chip label={`${cat.tva}%`} size="small"
                      sx={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, fontWeight: 700 }} />
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>—</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpen(cat)}
                      sx={{ color: '#60a5fa', '&:hover': { background: 'rgba(96,165,250,0.1)' } }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(cat)}
                      sx={{ color: '#ef4444', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
        PaperProps={{ className: 'bento-card', sx: { borderRadius: 3, background: 'rgba(8,8,7,0.97)' } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.4rem', color: '#fff' }}>
          {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nom de la catégorie" value={formData.nom}
            onChange={e => setFormData({ ...formData, nom: e.target.value })}
            margin="normal" required sx={inputSx} />
          <TextField fullWidth label="Taux TVA (%)" type="number" value={formData.tva}
            onChange={e => setFormData({ ...formData, tva: parseFloat(e.target.value) || 0 })}
            margin="normal" required sx={inputSx}
            helperText="0% = Formation · 10% = Services · 20% = Informatique" />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleClose}
            sx={{ borderRadius: 2, px: 3, color: 'rgba(255,255,255,0.7)' }}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} variant="contained"
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}>
            {editingCategory ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
