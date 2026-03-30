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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getArticles, addArticle, updateArticle, deleteArticle, getCategories } from '../services/jsonService';
import { LordIcon, Icons } from '../components/LordIcon';

export const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    designation: '',
    prix_unitaire: 0,
    categorie_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [articlesData, categoriesData] = await Promise.all([
      getArticles(),
      getCategories()
    ]);
    setArticles(articlesData);
    setCategories(categoriesData);
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.nom : '';
  };

  const handleOpen = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        designation: article.designation,
        prix_unitaire: article.prix_unitaire,
        categorie_id: article.categorie_id
      });
    } else {
      setEditingArticle(null);
      setFormData({ designation: '', prix_unitaire: 0, categorie_id: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingArticle(null);
  };

  const handleSubmit = async () => {
    if (editingArticle) {
      await updateArticle(editingArticle.id, formData);
    } else {
      await addArticle(formData);
    }
    handleClose();
    loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      await deleteArticle(id);
      loadData();
    }
  };

  return (
    <Box className="fade-in-up">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <LordIcon 
            src={Icons.settings}
            trigger="loop"
            size={48}
            colors="primary:#D4A853"
          />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
            Gestion des Articles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 700
          }}
        >
          Nouvel Article
        </Button>
      </Box>

      <TableContainer component={Paper} className="bento-card" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: 1 }}>Désignation</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: 1 }}>Prix Unitaire</TableCell>
              <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: 1 }}>Catégorie</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: 1 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.map((article) => (
              <TableRow 
                key={article.id}
                sx={{
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.03)'
                  }
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{article.designation}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{article.prix_unitaire.toFixed(2)} €</TableCell>
                <TableCell>{getCategoryName(article.categorie_id)}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    onClick={() => handleOpen(article)} 
                    sx={{ 
                      color: '#60a5fa',
                      '&:hover': { background: 'rgba(96, 165, 250, 0.1)' }
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(article.id)} 
                    sx={{ 
                      color: '#ef4444',
                      '&:hover': { background: 'rgba(239, 68, 68, 0.1)' }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          className: 'bento-card',
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
          {editingArticle ? 'Modifier l\'Article' : 'Nouvel Article'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Désignation"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            margin="normal"
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            fullWidth
            label="Prix Unitaire"
            type="number"
            value={formData.prix_unitaire}
            onChange={(e) => setFormData({ ...formData, prix_unitaire: parseFloat(e.target.value) })}
            margin="normal"
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={formData.categorie_id}
              onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
              sx={{ borderRadius: 2 }}
            >
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nom} (TVA: {cat.tva}%)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleClose}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            {editingArticle ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
