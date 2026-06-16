import React, { useState, useEffect } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getArticles, addArticle, updateArticle, deleteArticle, getCategories } from '../services/mongodbService';
import { notify } from '../services/notificationService';
import { LordIcon, Icons } from '../components/LordIcon';

import { useLanguage } from '../contexts/LanguageContext';

export const Articles = () => {
  const { t } = useLanguage();
  const [articles, setArticles]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen]           = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData]   = useState({ designation: '', prix_unitaire: 0, categorie_id: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [a, c] = await Promise.all([getArticles(), getCategories()]);
    setArticles(a);
    setCategories(c);
  };

  const getCategoryName = (catId) => {
    // Handle both string ID and populated object
    const id = typeof catId === 'object' ? catId?.id || catId?._id?.toString() : catId;
    return categories.find(c => c.id === id || c._id?.toString() === id)?.nom || '—';
  };
  
  const getTVA = (catId) => {
    // Handle both string ID and populated object
    const id = typeof catId === 'object' ? catId?.id || catId?._id?.toString() : catId;
    return categories.find(c => c.id === id || c._id?.toString() === id)?.tva ?? '—';
  };

  const handleOpen = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({ designation: article.designation, prix_unitaire: article.prix_unitaire, categorie_id: article.categorie_id });
    } else {
      setEditingArticle(null);
      setFormData({ designation: '', prix_unitaire: 0, categorie_id: '' });
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditingArticle(null); };

  const handleSubmit = async () => {
    if (editingArticle) {
      await updateArticle(editingArticle.id, formData);
      notify.articleCree(formData.designation); // réutilise même message
    } else {
      await addArticle(formData);
      notify.articleCree(formData.designation);
    }
    handleClose();
    loadData();
  };

  const handleDelete = async (article) => {
    if (window.confirm(`Supprimer l'article "${article.designation}" ?`)) {
      await deleteArticle(article.id);
      notify.articleSupprime(article.designation);
      loadData();
    }
  };

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

  return (
    <Box className="fade-in-up">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <LordIcon src={Icons.settings} trigger="loop" size={48} colors="primary:#D4A853" />
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>
              {t('articles.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              {articles.length} {t('articles.count')}
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}
          sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 700 }}>
          {t('articles.newArticle')}
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} className="bento-card" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              {[t('articles.table.designation'), t('common.unitPrice'), t('articles.table.category'), 'TVA', t('common.actions')].map(h => (
                <TableCell key={h}
                  align={h === 'Prix Unitaire' || h === 'Actions' ? 'right' : 'left'}
                  sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem',
                        letterSpacing: 1, color: 'rgba(255,255,255,0.6)' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'rgba(255,255,255,0.4)' }}>
                  {t('articles.noArticles')}
                </TableCell>
              </TableRow>
            ) : articles.map(article => (
              <TableRow key={article.id}
                sx={{ '&:hover': { background: 'rgba(255,255,255,0.03)' } }}>
                <TableCell sx={{ fontWeight: 600, color: '#fff' }}>{article.designation}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#D4A853' }}>
                  {Number(article.prix_unitaire).toFixed(2)} MAD
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {getCategoryName(article.categorie_id)}
                </TableCell>
                <TableCell>
                  <Chip label={`${getTVA(article.categorie_id)}%`} size="small"
                    sx={{ background: 'rgba(212,168,83,0.15)', color: '#D4A853',
                          border: '1px solid rgba(212,168,83,0.3)', fontWeight: 700 }} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpen(article)}
                    sx={{ color: '#60a5fa', '&:hover': { background: 'rgba(96,165,250,0.1)' } }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(article)}
                    sx={{ color: '#ef4444', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
        PaperProps={{ className: 'bento-card', sx: { borderRadius: 3, background: 'rgba(8,8,7,0.97)' } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.4rem', color: '#fff' }}>
          {editingArticle ? t('articles.dialog.edit') : t('articles.dialog.add')}
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label={t('articles.dialog.fields.designation')} value={formData.designation}
            onChange={e => setFormData({ ...formData, designation: e.target.value })}
            margin="normal" required sx={inputSx} />
          <TextField fullWidth label={`${t('articles.dialog.fields.unitPrice')} (MAD)`} type="number" value={formData.prix_unitaire}
            onChange={e => setFormData({ ...formData, prix_unitaire: parseFloat(e.target.value) || 0 })}
            margin="normal" required sx={inputSx} />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>{t('articles.dialog.fields.category')}</InputLabel>
            <Select value={formData.categorie_id}
              onChange={e => setFormData({ ...formData, categorie_id: e.target.value })}
              sx={{ borderRadius: 2 }}>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nom} — TVA {cat.tva}%
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleClose}
            sx={{ borderRadius: 2, px: 3, color: 'rgba(255,255,255,0.7)' }}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} variant="contained"
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}>
            {editingArticle ? t('articles.dialog.buttons.save') : t('articles.dialog.buttons.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
