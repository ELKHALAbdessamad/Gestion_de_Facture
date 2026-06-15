import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Grid, Divider, Avatar,
  MenuItem, Select, FormControl, InputLabel, IconButton, Chip
} from '@mui/material';
import { Save, Business, Add } from '@mui/icons-material';
import { getParametres, updateParametres } from '../services/jsonService';
import { notify } from '../services/notificationService';
import { AnimatedCard } from '../components/AnimatedCard';
import { BackendLimitations } from '../components/BackendLimitations';
import { DEVISES } from '../utils/currency';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    '& fieldset': { border: 'none' },
    '&:hover': { background: 'rgba(255,255,255,0.05)' },
    '&.Mui-focused': { border: '1px solid rgba(212,168,83,0.4)' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#D4A853' },
};

const emptySociete = () => ({
  nom: '', adresse: '', ville: '', code_postal: '', tel: '', email: '', siret: ''
});

export const Parametres = () => {
  const [formData, setFormData] = useState({
    devise: 'MAD',
    societe_active: 0,
    societes: [emptySociete()],
    entreprise: emptySociete(),
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const data = await getParametres();
    if (data) {
      const societes = data.societes?.length
        ? data.societes
        : [data.entreprise || emptySociete()];
      setFormData({
        devise: data.devise || 'MAD',
        societe_active: data.societe_active ?? 0,
        societes,
        entreprise: societes[data.societe_active ?? 0] || data.entreprise || emptySociete(),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const active = formData.societes[formData.societe_active] || formData.societes[0];
      await updateParametres({
        devise: formData.devise,
        societe_active: formData.societe_active,
        societes: formData.societes,
        entreprise: active,
      });
      notify.parametresSauvegardes();
    } catch {
      notify.error('Erreur lors de la sauvegarde des paramètres');
    }
  };

  const setSocieteField = (field, value) => {
    setFormData(prev => {
      const societes = [...prev.societes];
      const idx = prev.societe_active;
      societes[idx] = { ...societes[idx], [field]: value };
      return { ...prev, societes, entreprise: societes[idx] };
    });
  };

  const switchSociete = (index) => {
    setFormData(prev => ({
      ...prev,
      societe_active: index,
      entreprise: prev.societes[index],
    }));
  };

  const addSociete = () => {
    setFormData(prev => ({
      ...prev,
      societes: [...prev.societes, emptySociete()],
      societe_active: prev.societes.length,
      entreprise: emptySociete(),
    }));
  };

  const removeSociete = (index) => {
    if (formData.societes.length <= 1) return;
    setFormData(prev => {
      const societes = prev.societes.filter((_, i) => i !== index);
      const societe_active = Math.min(prev.societe_active, societes.length - 1);
      return {
        ...prev,
        societes,
        societe_active,
        entreprise: societes[societe_active],
      };
    });
  };

  const e = formData.societes[formData.societe_active] || formData.entreprise;

  return (
    <Box className="fade-in-up">
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg,#D4A853,#F4D03F)', color: '#080807' }}>
          <Business />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>
            Paramètres Entreprise
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Multi-société, devise et informations affichées sur les factures PDF
          </Typography>
        </Box>
      </Box>

      <AnimatedCard>
        <Paper className="bento-card" sx={{ p: 4, borderRadius: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>

              {/* Devise */}
              <Grid item xs={12} md={6}>
                <Typography variant="overline" sx={{ color: '#D4A853', fontWeight: 700, letterSpacing: 2 }}>
                  Devise
                </Typography>
                <Divider sx={{ borderColor: 'rgba(212,168,83,0.2)', mt: 0.5, mb: 2 }} />
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Devise de facturation</InputLabel>
                  <Select
                    value={formData.devise}
                    label="Devise de facturation"
                    onChange={v => setFormData(prev => ({ ...prev, devise: v.target.value }))}
                    sx={{ color: '#fff' }}
                  >
                    {DEVISES.map(d => (
                      <MenuItem key={d.code} value={d.code}>{d.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Multi-société */}
              <Grid item xs={12} md={6}>
                <Typography variant="overline" sx={{ color: '#D4A853', fontWeight: 700, letterSpacing: 2 }}>
                  Multi-société
                </Typography>
                <Divider sx={{ borderColor: 'rgba(212,168,83,0.2)', mt: 0.5, mb: 2 }} />
                <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                  {formData.societes.map((s, i) => (
                    <Chip
                      key={i}
                      label={s.nom || `Société ${i + 1}`}
                      onClick={() => switchSociete(i)}
                      onDelete={formData.societes.length > 1 ? () => removeSociete(i) : undefined}
                      color={formData.societe_active === i ? 'primary' : 'default'}
                      sx={{
                        background: formData.societe_active === i
                          ? 'linear-gradient(135deg,#D4A853,#F4D03F)'
                          : 'rgba(255,255,255,0.05)',
                        color: formData.societe_active === i ? '#080807' : '#fff',
                        fontWeight: 600,
                      }}
                    />
                  ))}
                  <IconButton onClick={addSociete} sx={{ color: '#D4A853', border: '1px dashed rgba(212,168,83,0.4)' }}>
                    <Add />
                  </IconButton>
                </Box>
              </Grid>

              {/* Identité */}
              <Grid item xs={12}>
                <Typography variant="overline" sx={{ color: '#D4A853', fontWeight: 700, letterSpacing: 2 }}>
                  Identité — {e.nom || `Société ${formData.societe_active + 1}`}
                </Typography>
                <Divider sx={{ borderColor: 'rgba(212,168,83,0.2)', mt: 0.5, mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Nom de l'entreprise" value={e.nom}
                  onChange={v => setSocieteField('nom', v.target.value)} required sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="SIRET / RC" value={e.siret}
                  onChange={v => setSocieteField('siret', v.target.value)} required sx={fieldSx} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Adresse" value={e.adresse}
                  onChange={v => setSocieteField('adresse', v.target.value)} required sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Ville" value={e.ville}
                  onChange={v => setSocieteField('ville', v.target.value)} required sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Code Postal" value={e.code_postal}
                  onChange={v => setSocieteField('code_postal', v.target.value)} required sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Téléphone" value={e.tel}
                  onChange={v => setSocieteField('tel', v.target.value)} required sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Email professionnel" type="email" value={e.email}
                  onChange={v => setSocieteField('email', v.target.value)} required sx={fieldSx} />
              </Grid>

              {/* Aperçu PDF */}
              <Grid item xs={12}>
                <Typography variant="overline" sx={{ color: '#D4A853', fontWeight: 700, letterSpacing: 2 }}>
                  Aperçu dans le PDF
                </Typography>
                <Divider sx={{ borderColor: 'rgba(212,168,83,0.2)', mt: 0.5, mb: 2 }} />
                <Box sx={{ p: 3, borderRadius: 2, border: '1px dashed rgba(212,168,83,0.3)',
                           background: 'rgba(212,168,83,0.03)' }}>
                  <Typography sx={{ color: '#D4A853', fontWeight: 700, fontSize: '1.1rem' }}>
                    {e.nom || 'Nom entreprise'}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', mt: 0.5 }}>
                    {e.adresse || 'Adresse'} — {e.code_postal} {e.ville}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                    Tél : {e.tel || '—'} · Email : {e.email || '—'}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                    SIRET/RC : {e.siret || '—'} · Devise : {formData.devise}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" startIcon={<Save />}
                  sx={{ px: 4, py: 1.5, fontWeight: 700, borderRadius: 2 }}>
                  Enregistrer les Paramètres
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </AnimatedCard>

      <BackendLimitations />
    </Box>
  );
};
