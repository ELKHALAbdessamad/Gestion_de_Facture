import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Grid, Divider, Avatar,
  MenuItem, Select, FormControl, InputLabel, IconButton, Chip, Alert
} from '@mui/material';
import { Save, Business, Add } from '@mui/icons-material';
import { getParametres, updateParametres, setup2FA, confirmSetup2FA, disable2FA, get2FAStatus } from '../services/mongodbService';
import { notify } from '../services/notificationService';
import { AnimatedCard } from '../components/AnimatedCard';
import { DEVISES } from '../utils/currency';
import { useLanguage } from '../contexts/LanguageContext';

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
  nom: '', adresse: '', ville: '', code_postal: '', tel: '', email: '',
  siret: '',             // RC (Registre Commerce)
  ice: '',               // Identifiant Commun Entreprise
  identifiant_fiscal: '', // Identifiant Fiscal
  cnss: '',              // CNSS
  logo: ''
});

export const Parametres = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    devise: 'MAD',
    entreprise_active: 0,
    entreprises: [emptySociete()],
    entreprise: emptySociete(),
  });

  // État 2FA
  const [twoFA, setTwoFA] = useState({ enabled: false, qrCode: null, secret: null, setupCode: '', disableCode: '', step: 'idle' });

  useEffect(() => { load(); load2FAStatus(); }, []);

  const load = async () => {
    const data = await getParametres();
    if (data) {
      const entreprises = data.entreprises?.length
        ? data.entreprises
        : [data.entreprise || emptySociete()];
      setFormData({
        devise: data.devise || 'MAD',
        entreprise_active: data.entreprise_active ?? 0,
        entreprises,
        entreprise: entreprises[data.entreprise_active ?? 0] || data.entreprise || emptySociete(),
      });
    }
  };

  const load2FAStatus = async () => {
    try {
      const { totp_enabled } = await get2FAStatus();
      setTwoFA(prev => ({ ...prev, enabled: totp_enabled }));
    } catch {}
  };

  const handleSetup2FA = async () => {
    try {
      const { qrCode, secret } = await setup2FA();
      setTwoFA(prev => ({ ...prev, qrCode, secret, step: 'scan' }));
    } catch (e) {
      notify.error('Erreur lors de la configuration 2FA');
    }
  };

  const handleConfirm2FA = async () => {
    try {
      await confirmSetup2FA(twoFA.setupCode);
      setTwoFA({ enabled: true, qrCode: null, secret: null, setupCode: '', disableCode: '', step: 'idle' });
      notify.success('2FA activé avec succès !');
    } catch {
      notify.error('Code incorrect');
    }
  };

  const handleDisable2FA = async () => {
    try {
      await disable2FA(twoFA.disableCode);
      setTwoFA({ enabled: false, qrCode: null, secret: null, setupCode: '', disableCode: '', step: 'idle' });
      notify.success('2FA désactivé');
    } catch {
      notify.error('Code incorrect');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const active = formData.entreprises[formData.entreprise_active] || formData.entreprises[0];
      const saved = await updateParametres({
        devise: formData.devise,
        entreprise_active: formData.entreprise_active,
        entreprises: formData.entreprises,
        entreprise: active,
      });
      notify.parametresSauvegardes();

      // 🌐 Synchroniser les paramètres vers Railway/Atlas
      try {
        const { syncParametresToRailway } = await import('../services/railwaySync');
        await syncParametresToRailway(saved || {
          devise: formData.devise,
          entreprise_active: formData.entreprise_active,
          entreprises: formData.entreprises,
          entreprise: active,
        });
      } catch (syncErr) {
        console.warn('Sync Railway paramètres échoué (non bloquant):', syncErr);
      }
    } catch {
      notify.error('Erreur lors de la sauvegarde des paramètres');
    }
  };

  const setSocieteField = (field, value) => {
    setFormData(prev => {
      const entreprises = [...prev.entreprises];
      const idx = prev.entreprise_active;
      entreprises[idx] = { ...entreprises[idx], [field]: value };
      return { ...prev, entreprises, entreprise: entreprises[idx] };
    });
  };

  const switchSociete = (index) => {
    setFormData(prev => ({
      ...prev,
      entreprise_active: index,
      entreprise: prev.entreprises[index],
    }));
  };

  const addSociete = () => {
    setFormData(prev => ({
      ...prev,
      entreprises: [...prev.entreprises, emptySociete()],
      entreprise_active: prev.entreprises.length,
      entreprise: emptySociete(),
    }));
  };

  const removeSociete = (index) => {
    if (formData.entreprises.length <= 1) return;
    setFormData(prev => {
      const entreprises = prev.entreprises.filter((_, i) => i !== index);
      const entreprise_active = Math.min(prev.entreprise_active, entreprises.length - 1);
      return {
        ...prev,
        entreprises,
        entreprise_active,
        entreprise: entreprises[entreprise_active],
      };
    });
  };

  const e = formData.entreprises[formData.entreprise_active] || formData.entreprise;

  return (
    <Box className="fade-in-up">
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg,#D4A853,#F4D03F)', color: '#080807' }}>
          <Business />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>
            {t('settings.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            {t('settings.subtitle')}
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
                  {t('settings.currency.title')}
                </Typography>
                <Divider sx={{ borderColor: 'rgba(212,168,83,0.2)', mt: 0.5, mb: 2 }} />
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>{t('settings.currency.label')}</InputLabel>
                  <Select
                    value={formData.devise}
                    label={t('settings.currency.label')}
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
                  {t('settings.multiCompany.title')}
                </Typography>
                <Divider sx={{ borderColor: 'rgba(212,168,83,0.2)', mt: 0.5, mb: 2 }} />
                <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                  {formData.entreprises.map((s, i) => (
                    <Chip
                      key={i}
                      label={s.nom || `${t('settings.multiCompany.company')} ${i + 1}`}
                      onClick={() => switchSociete(i)}
                      onDelete={formData.entreprises.length > 1 ? () => removeSociete(i) : undefined}
                      color={formData.entreprise_active === i ? 'primary' : 'default'}
                      sx={{
                        background: formData.entreprise_active === i
                          ? 'linear-gradient(135deg,#D4A853,#F4D03F)'
                          : 'rgba(255,255,255,0.05)',
                        color: formData.entreprise_active === i ? '#080807' : '#fff',
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
                  {t('settings.identity.title')} — {e.nom || `${t('settings.multiCompany.company')} ${formData.entreprise_active + 1}`}
                </Typography>
                <Divider sx={{ borderColor: 'rgba(212,168,83,0.2)', mt: 0.5, mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Nom / Raison sociale" value={e.nom}
                  onChange={v => setSocieteField('nom', v.target.value)} required sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="RC (Registre de Commerce)" value={e.siret}
                  onChange={v => setSocieteField('siret', v.target.value)} sx={fieldSx} />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField fullWidth label="ICE (Identifiant Commun Entreprise)" value={e.ice || ''}
                  onChange={v => setSocieteField('ice', v.target.value)} sx={fieldSx}
                  helperText="15 chiffres" inputProps={{ maxLength: 15 }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="IF (Identifiant Fiscal)" value={e.identifiant_fiscal || ''}
                  onChange={v => setSocieteField('identifiant_fiscal', v.target.value)} sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="CNSS" value={e.cnss || ''}
                  onChange={v => setSocieteField('cnss', v.target.value)} sx={fieldSx} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label={t('settings.identity.address')} value={e.adresse}
                  onChange={v => setSocieteField('adresse', v.target.value)} required sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label={t('settings.identity.city')} value={e.ville}
                  onChange={v => setSocieteField('ville', v.target.value)} required sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label={t('settings.identity.postalCode')} value={e.code_postal}
                  onChange={v => setSocieteField('code_postal', v.target.value)} required sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label={t('settings.identity.phone')} value={e.tel}
                  onChange={v => setSocieteField('tel', v.target.value)} required sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label={t('settings.identity.email')} type="email" value={e.email}
                  onChange={v => setSocieteField('email', v.target.value)} required sx={fieldSx} />
              </Grid>

              {/* Aperçu PDF */}
              <Grid item xs={12}>
                <Typography variant="overline" sx={{ color: '#D4A853', fontWeight: 700, letterSpacing: 2 }}>
                  {t('settings.pdfPreview.title')}
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
                    SIRET/RC : {e.siret || '—'} | ICE : {e.ice || '—'} | IF : {e.identifiant_fiscal || '—'} | Devise : {formData.devise}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" startIcon={<Save />}
                  sx={{ px: 4, py: 1.5, fontWeight: 700, borderRadius: 2 }}>
                  {t('settings.saveButton')}
                </Button>
              </Grid>

              {/* ── Section 2FA ── */}
              <Grid item xs={12}>
                <Divider sx={{ borderColor: 'rgba(212,168,83,0.2)', my: 1 }} />
                <Typography variant="overline" sx={{ color: '#D4A853', fontWeight: 700, letterSpacing: 2 }}>
                  Sécurité — Authentification à 2 facteurs (2FA)
                </Typography>
                <Divider sx={{ borderColor: 'rgba(212,168,83,0.2)', mt: 0.5, mb: 2 }} />

                {twoFA.enabled ? (
                  <Box>
                    <Alert severity="success" sx={{ mb: 2, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>
                      ✅ La vérification en 2 étapes est activée sur votre compte.
                    </Alert>
                    {twoFA.step !== 'disable' ? (
                      <Button variant="outlined" color="error" onClick={() => setTwoFA(p => ({ ...p, step: 'disable' }))}
                        sx={{ borderRadius: 2 }}>
                        Désactiver le 2FA
                      </Button>
                    ) : (
                      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                        <TextField
                          label="Code Google Authenticator"
                          value={twoFA.disableCode}
                          onChange={e => setTwoFA(p => ({ ...p, disableCode: e.target.value.replace(/\D/g,'').slice(0,6) }))}
                          inputProps={{ maxLength: 6 }}
                          sx={{ ...fieldSx, width: 220 }}
                        />
                        <Button variant="contained" color="error" onClick={handleDisable2FA}
                          disabled={twoFA.disableCode.length !== 6} sx={{ borderRadius: 2, fontWeight: 700 }}>
                          Confirmer la désactivation
                        </Button>
                        <Button onClick={() => setTwoFA(p => ({ ...p, step: 'idle', disableCode: '' }))}
                          sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          Annuler
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : twoFA.step === 'idle' ? (
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
                      Protégez votre compte avec Google Authenticator, Authy ou toute app TOTP compatible.
                    </Typography>
                    <Button variant="outlined" onClick={handleSetup2FA}
                      sx={{ borderColor: '#D4A853', color: '#D4A853', borderRadius: 2, fontWeight: 700 }}>
                      Configurer le 2FA
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                      1. Scannez ce QR code avec votre application (Google Authenticator, Authy...)<br/>
                      2. Entrez le code à 6 chiffres généré pour confirmer
                    </Typography>
                    {twoFA.qrCode && (
                      <Box mb={2}>
                        <img src={twoFA.qrCode} alt="QR Code 2FA"
                          style={{ border: '4px solid #D4A853', borderRadius: 8, display: 'block' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mt: 1, display: 'block' }}>
                          Clé manuelle : {twoFA.secret}
                        </Typography>
                      </Box>
                    )}
                    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                      <TextField
                        label="Code de confirmation (6 chiffres)"
                        value={twoFA.setupCode}
                        onChange={e => setTwoFA(p => ({ ...p, setupCode: e.target.value.replace(/\D/g,'').slice(0,6) }))}
                        inputProps={{ maxLength: 6 }}
                        sx={{ ...fieldSx, width: 260 }}
                      />
                      <Button variant="contained" onClick={handleConfirm2FA}
                        disabled={twoFA.setupCode.length !== 6}
                        sx={{ background: 'linear-gradient(135deg,#D4A853,#F4D03F)', color: '#080807', fontWeight: 700, borderRadius: 2 }}>
                        Activer le 2FA
                      </Button>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </form>
        </Paper>
      </AnimatedCard>
    </Box>
  );
};
