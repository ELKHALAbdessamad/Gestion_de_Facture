import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Select, MenuItem,
  LinearProgress, IconButton, List, ListItem, ListItemText
} from '@mui/material';
import { Close, Archive, Download } from '@mui/icons-material';
import { archiveAnnee, getAvailableYears } from '../utils/archiveService';
import { notify } from '../services/notificationService';

export const ArchiveModal = ({ open, onClose, factures, clients, parametres }) => {
  const [selectedYear, setSelectedYear] = useState('');
  const [progress, setProgress]         = useState(0);
  const [loading, setLoading]           = useState(false);

  const years = getAvailableYears(factures);

  const handleArchive = async () => {
    if (!selectedYear) { notify.warning('Sélectionnez une année'); return; }
    setLoading(true);
    setProgress(0);
    try {
      const nb = await archiveAnnee(
        selectedYear, factures, clients, parametres,
        (p) => setProgress(p)
      );
      notify.success(`✅ Archive ${selectedYear} générée — ${nb} factures archivées`);
      onClose();
    } catch (e) {
      notify.error(e.message || 'Erreur lors de la génération de l\'archive');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: {
        background: 'rgba(12,12,12,0.98)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(212,168,83,0.3)', borderRadius: 3
      }}}>

      <DialogTitle sx={{ color: '#fff', fontWeight: 700 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Archive sx={{ color: '#D4A853' }} />
            <Typography variant="h6" fontWeight={700}>Archivage Annuel</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
          Génère une archive ZIP contenant les PDF de toutes les factures,
          un récapitulatif Excel et une sauvegarde JSON (conformité légale 10 ans).
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block' }}>
            Sélectionner l'année à archiver
          </Typography>
          <Select fullWidth value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
            displayEmpty disabled={loading}
            sx={{ background: 'rgba(255,255,255,0.03)', borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                  '& fieldset': { border: 'none' } }}>
            <MenuItem value="" disabled>Choisir une année...</MenuItem>
            {years.map(y => (
              <MenuItem key={y} value={y}>
                {y} — {factures.filter(f =>
                  f.date_creation && new Date(f.date_creation).getFullYear() === y
                ).length} factures
              </MenuItem>
            ))}
          </Select>
        </Box>

        {years.length === 0 && (
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', py: 2 }}>
            Aucune facture disponible pour l'archivage
          </Typography>
        )}

        {loading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: '#D4A853', mb: 1, display: 'block' }}>
              Génération en cours... {progress}%
            </Typography>
            <LinearProgress variant="determinate" value={progress}
              sx={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.05)',
                    '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#D4A853,#F4D03F)', borderRadius: 4 }
              }} />
          </Box>
        )}

        <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: 'rgba(212,168,83,0.05)',
                   border: '1px dashed rgba(212,168,83,0.2)' }}>
          <Typography variant="caption" sx={{ color: '#D4A853', fontWeight: 700, display: 'block', mb: 1 }}>
            Contenu de l'archive ZIP
          </Typography>
          <List dense sx={{ p: 0 }}>
            {['📄 Factures_PDF_[année]/ — PDF de chaque facture',
              '📊 Recapitulatif_[année].xlsx — Tableau Excel',
              '💾 Backup_[année].json — Sauvegarde légale complète',
              '📝 README.txt — Notice d\'archivage'
            ].map(item => (
              <ListItem key={item} sx={{ py: 0.3, px: 0 }}>
                <ListItemText primary={item}
                  primaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' } }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}
          sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}
          variant="outlined">
          Annuler
        </Button>
        <Button variant="contained" startIcon={<Download />}
          onClick={handleArchive} disabled={loading || !selectedYear}
          sx={{ background: 'linear-gradient(135deg,#D4A853,#F4D03F)',
                color: '#080807', fontWeight: 700 }}>
          {loading ? 'Archivage...' : `Archiver ${selectedYear}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
