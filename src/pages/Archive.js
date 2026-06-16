import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Typography, Paper, Grid, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Select, MenuItem, FormControl, InputLabel, Divider
} from '@mui/material';
import {
  Archive as ArchiveIcon, GetApp, TableChart, CalendarMonth, Receipt,
  CheckCircle, Schedule, Cancel, ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getArchiveYears, getFacturesArchive, getClients } from '../services/mongodbService';
import { exportFacturesToExcel } from '../utils/excelExporter';
import { formatMoney } from '../utils/currency';
import { notify } from '../services/notificationService';
import { AnimatedCard } from '../components/AnimatedCard';

export const Archive = () => {
  const navigate = useNavigate();
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [archiveData, setArchiveData] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const [yearsData, clientsData] = await Promise.all([
          getArchiveYears(),
          getClients()
        ]);
        setYears(yearsData);
        setClients(clientsData);
        if (yearsData.length > 0) {
          setSelectedYear(String(yearsData[0]));
        }
      } catch (err) {
        // Fallback: générer des années depuis l'année actuelle
        const currentYear = new Date().getFullYear();
        setYears([currentYear, currentYear - 1, currentYear - 2]);
        setSelectedYear(String(currentYear));
      }
    };
    loadYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      loadArchive(selectedYear);
    }
  }, [selectedYear]);

  const loadArchive = async (year) => {
    setLoading(true);
    try {
      const data = await getFacturesArchive(year);
      setArchiveData(data);
    } catch (err) {
      notify.error(`Impossible de charger les archives de ${year}`);
      setArchiveData(null);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId) => {
    if (typeof clientId === 'object' && clientId?.nom) return clientId.nom;
    const client = clients.find(c => c.id === clientId || c._id === clientId);
    return client ? client.nom : 'Client inconnu';
  };

  const statusColor = (s) => {
    if (s === 'Payée') return 'success';
    if (s === 'En attente') return 'warning';
    if (s === 'Rejetée') return 'error';
    return 'default';
  };

  const handleExportExcel = () => {
    if (!archiveData?.factures?.length) return;
    exportFacturesToExcel(archiveData.factures, clients, `Archive_${selectedYear}`);
    notify.excelExporte();
  };

  const cardSx = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 3, p: 3,
  };

  const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
    <AnimatedCard delay={delay}>
      <Paper sx={{ ...cardSx, textAlign: 'center' }}>
        <Box sx={{
          width: 48, height: 48, borderRadius: 2, mx: 'auto', mb: 1,
          background: `${color}20`, display: 'flex', alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon sx={{ color, fontSize: 24 }} />
        </Box>
        <Typography variant="h4" fontWeight={800} sx={{ color }}>
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
          {label}
        </Typography>
      </Paper>
    </AnimatedCard>
  );

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/factures')}
              sx={{ color: 'rgba(255,255,255,0.6)' }}
            >
              Retour
            </Button>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>
                🗂️ Archives Annuelles
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Consultation et export des factures archivées par exercice
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Exercice</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                label="Exercice"
                sx={{
                  color: '#fff',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 2,
                  '& fieldset': { border: 'none' },
                  '& .MuiSelect-icon': { color: '#D4A853' }
                }}
              >
                {years.map(y => (
                  <MenuItem key={y} value={String(y)}>
                    <CalendarMonth sx={{ fontSize: 16, mr: 1, color: '#D4A853' }} />
                    Exercice {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<TableChart />}
              onClick={handleExportExcel}
              disabled={!archiveData?.factures?.length}
              sx={{
                borderColor: '#4ade80', color: '#4ade80',
                '&:hover': { background: 'rgba(74,222,128,0.1)' },
                '&:disabled': { borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.3)' }
              }}
            >
              Export Excel
            </Button>
          </Box>
        </Box>
      </motion.div>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress sx={{ color: '#D4A853' }} />
        </Box>
      ) : archiveData ? (
        <>
          {/* KPI Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={Receipt}
                label="Total Factures"
                value={archiveData.stats.count}
                color="#D4A853"
                delay={0}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={CheckCircle}
                label="Payées"
                value={archiveData.stats.payees}
                color="#4ade80"
                delay={100}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={Schedule}
                label="En attente"
                value={archiveData.stats.enAttente}
                color="#fbbf24"
                delay={200}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={Cancel}
                label="Rejetées"
                value={archiveData.stats.rejetees}
                color="#ef4444"
                delay={300}
              />
            </Grid>
          </Grid>

          {/* Financial Summary */}
          <AnimatedCard delay={400}>
            <Paper sx={{ ...cardSx, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A853', mb: 3 }}>
                📊 Bilan Financier — Exercice {selectedYear}
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Total HT
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', mt: 0.5 }}>
                      {formatMoney(archiveData.stats.totalHT, 'MAD')}
                    </Typography>
                  </Box>
                </Grid>
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Total TTC
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ color: '#D4A853', mt: 0.5 }}>
                      {formatMoney(archiveData.stats.totalTTC, 'MAD')}
                    </Typography>
                  </Box>
                </Grid>
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Total Encaissé
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ color: '#4ade80', mt: 0.5 }}>
                      {formatMoney(archiveData.stats.totalEncaisse, 'MAD')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </AnimatedCard>

          {/* Table des factures archivées */}
          <AnimatedCard delay={500}>
            <Paper sx={{ ...cardSx }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#D4A853', mb: 2 }}>
                📋 Factures — Exercice {selectedYear} ({archiveData.factures.length})
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Numéro', 'Date', 'Client', 'Total HT', 'TVA', 'Total TTC', 'Statut'].map(h => (
                        <TableCell
                          key={h}
                          sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.8, borderColor: 'rgba(255,255,255,0.08)' }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {archiveData.factures.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'rgba(255,255,255,0.4)' }}>
                          Aucune facture pour l'exercice {selectedYear}
                        </TableCell>
                      </TableRow>
                    ) : (
                      archiveData.factures.map((f, i) => (
                        <TableRow
                          key={f.id || i}
                          sx={{ '&:hover': { background: 'rgba(212,168,83,0.05)' }, cursor: 'pointer' }}
                          onClick={() => navigate(`/factures/${f.id}`)}
                        >
                          <TableCell sx={{ color: '#D4A853', fontWeight: 600, borderColor: 'rgba(255,255,255,0.05)' }}>
                            {f.numero}
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.05)' }}>
                            {f.date_creation ? new Date(f.date_creation).toLocaleDateString('fr-FR') : '—'}
                          </TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 600, borderColor: 'rgba(255,255,255,0.05)' }}>
                            {getClientName(f.client_id)}
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.05)' }}>
                            {formatMoney(f.total_ht, 'MAD')}
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.05)' }}>
                            {formatMoney(f.tva, 'MAD')}
                          </TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 700, borderColor: 'rgba(255,255,255,0.05)' }}>
                            {formatMoney(f.total_ttc, 'MAD')}
                          </TableCell>
                          <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <Chip label={f.statut} color={statusColor(f.statut)} size="small" sx={{ fontWeight: 600 }} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </AnimatedCard>
        </>
      ) : (
        <Paper sx={{ ...cardSx, textAlign: 'center', py: 6 }}>
          <ArchiveIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Sélectionnez un exercice pour consulter les archives
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
