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
  IconButton
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../services/jsonService';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    tva: 20
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const handleOpen = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        nom: category.nom,
        tva: category.tva
      });
    } else {
      setEditingCategory(null);
      setFormData({ nom: '', tva: 20 });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, formData);
    } else {
      await addCategory(formData);
    }
    handleClose();
    loadCategories();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      await deleteCategory(id);
      loadCategories();
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestion des Catégories</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Nouvelle Catégorie
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell align="right">TVA (%)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.nom}</TableCell>
                <TableCell align="right">{category.tva}%</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(category)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(category.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="TVA (%)"
            type="number"
            value={formData.tva}
            onChange={(e) => setFormData({ ...formData, tva: parseFloat(e.target.value) })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
