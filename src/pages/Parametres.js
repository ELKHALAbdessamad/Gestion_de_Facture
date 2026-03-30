import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { getParametres, updateParametres } from '../services/jsonService';

export const Parametres = () => {
  const [formData, setFormData] = useState({
    entreprise: {
      nom: '',
      adresse: '',
      ville: '',
      code_postal: '',
      tel: '',
      email: '',
      siret: ''
    }
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadParametres();
  }, []);

  const loadParametres = async () => {
    const data = await getParametres();
    setFormData(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateParametres(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      entreprise: {
        ...formData.entreprise,
        [field]: value
      }
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Paramètres de l'Entreprise
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Paramètres enregistrés avec succès !
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de l'entreprise"
                value={formData.entreprise.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                value={formData.entreprise.adresse}
                onChange={(e) => handleChange('adresse', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ville"
                value={formData.entreprise.ville}
                onChange={(e) => handleChange('ville', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Code Postal"
                value={formData.entreprise.code_postal}
                onChange={(e) => handleChange('code_postal', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={formData.entreprise.tel}
                onChange={(e) => handleChange('tel', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.entreprise.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SIRET"
                value={formData.entreprise.siret}
                onChange={(e) => handleChange('siret', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
              >
                Enregistrer
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};
