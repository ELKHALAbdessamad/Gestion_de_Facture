import React, { useState, useEffect } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Chip,
  IconButton, TextField, InputAdornment, MenuItem, Select
} from '@mui/material';
import { Add, Visibility, GetApp, Edit, Delete, TableChart, Search, Archive } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getFactures, deleteFacture, getClients } from '../services/mongodbService';
import { getArticles, getParametres } from '../services/mongodbService';
import { downloadFacturePDF } from '../utils/pdfGenerator';
import { exportFacturesToExcel } from '../utils/excelExporter';
import { notify } from '../services/notificationService';
import { formatMoney } from '../utils/currency';
import { ArchiveModal } from '../components/ArchiveModal';
import { LordIcon, Icons } from '../components/LordIcon';
import { useAuth } from '../contexts/AuthContextMongoDB';
import { useLanguage } from '../contexts/LanguageContext';

export const Factures = () => {
  const { t, language } = useLanguage();
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [parametres, setParametres] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [filterYear, setFilterYear] = useState('Toutes');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [facturesData, clientsData, articlesData, parametresData] = await Promise.all([
      getFactures(), getClients(), getArticles(), getParametres()
    ]);
    setFactures(facturesData);
    setClients(clientsData);
    setArticles(articlesData);
    setParametres(parametresData);
  };

  const getClientName = (clientId) => {
    if (!clientId) return 'Client inconnu';
    if (typeof clientId === 'object' && clientId?.nom) return clientId.nom;
    const client = clients.find(c => String(c.id) === String(clientId) || String(c._id) === String(clientId));
    return client ? client.nom : 'Client inconnu';
  };

  const statusColor = (s) => {
    if (s === 'Payée')      return 'success';
    if (s === 'En attente') return 'warning';
    if (s === 'Rejetée')    return 'error';
    return 'default';
  };

  const handleDownloadPDF = async (facture) => {
    const client = clients.find(c => c.id === facture.client_id);
    if (client && parametres) {
      try {
        await downloadFacturePDF(facture, client, articles, parametres, null, language);
        notify.pdfGenere(facture.numero);
      } catch (e) {
        notify.error('Erreur lors de la génération du PDF');
      }
    }
  };

  const handleDelete = async (facture) => {
    if (window.confirm(`Supprimer la facture ${facture.numero} ?`)) {
      await deleteFacture(facture.id);
      notify.factureSupprimee(facture.numero);
      loadData();
    }
  };

  const handleExportExcel = () => {
    exportFacturesToExcel(filteredFactures, clients);
    notify.excelExporte();
  };

  // Filtrage + archivage annuel
  const availableYears = [...new Set(
    factures
      .map(f => f.date_creation && new Date(f.date_creation).getFullYear())
      .filter(Boolean)
  )].sort((a, b) => b - a);

  const filteredFactures = factures
    .filter(f => {
      const client = getClientName(f.client_id).toLowerCase();
      const num    = (f.numero || '').toLowerCase();
      const q      = search.toLowerCase();
      const matchSearch  = !q || client.includes(q) || num.includes(q);
      const matchStatut  = filterStatut === 'Tous' || f.statut === filterStatut;
      const year = f.date_creation ? new Date(f.date_creation).getFullYear() : null;
      const matchYear = filterYear === 'Toutes' || year === parseInt(filterYear, 10);
      return matchSearch && matchStatut && matchYear;
    })
    .sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));

  // KPI résumé rapide
  const totalTTC    = filteredFactures.reduce((s, f) => s + (f.total_ttc || 0), 0);
  const nbPayees    = filteredFactures.filter(f => f.statut === 'Payée').length;
  const nbEnAttente = filteredFactures.filter(f => f.statut === 'En attente').length;

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#fff',
      '& fieldset': { border: 'none' },
      '&:hover': { background: 'rgba(255,255,255,0.05)' },
    },
  };

  const devise = parametres?.devise || 'MAD';

  return (
    <Box className="fade-in-up">

      {/* ── En-tête ── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <LordIcon src={Icons.invoice} trigger="loop" size={48} colors="primary:#D4A853" />
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>
              {t('invoices.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              {filteredFactures.length} {t('invoices.count')} —
              Total&nbsp;TTC&nbsp;: <b style={{ color: '#D4A853' }}>{formatMoney(totalTTC, devise)}</b>
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap">
          {/* Export Excel */}
          <Button
            variant="outlined"
            startIcon={<TableChart />}
            onClick={handleExportExcel}
            sx={{
              borderColor: '#4ade80', color: '#4ade80', fontWeight: 600,
              '&:hover': { background: 'rgba(74,222,128,0.1)' }
            }}
          >
            Export Excel
          </Button>

          {/* Archivage annuel */}
          <Button
            variant="outlined"
            startIcon={<Archive />}
            onClick={() => setArchiveOpen(true)}
            sx={{
              borderColor: '#a78bfa', color: '#a78bfa', fontWeight: 600,
              '&:hover': { background: 'rgba(167,139,250,0.1)' }
            }}
          >
            Archiver
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/factures/nouvelle')}
            sx={{ borderRadius: 2, px: 3, py: 1.2, fontWeight: 700 }}
          >
            {t('invoices.newInvoice')}
          </Button>
        </Box>
      </Box>

      {/* ── Mini KPIs ── */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        {[
          { label: t('invoices.filters.all'), value: factures.length, color: '#D4A853' },
          { label: t('invoices.status.paid'), value: nbPayees, color: '#4ade80' },
          { label: t('invoices.status.pending'), value: nbEnAttente, color: '#fbbf24' },
          { label: t('invoices.status.rejected'), value: factures.filter(f => f.statut === 'Rejetée').length, color: '#ef4444' },
        ].map(k => (
          <Paper
            key={k.label}
            sx={{
              px: 3, py: 1.5, borderRadius: 2,
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${k.color}30`,
            }}
          >
            <Typography variant="h5" fontWeight={800} sx={{ color: k.color }}>{k.value}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
              {k.label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* ── Filtres ── */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder={t('invoices.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ ...inputSx, width: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'rgba(255,255,255,0.3)' }} />
              </InputAdornment>
            ),
          }}
        />
        <Select
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
          size="small"
          displayEmpty
          sx={{
            ...inputSx,
            '& .MuiSelect-select': { color: '#fff' },
            minWidth: 150,
          }}
        >
          <MenuItem value="Toutes">Toutes années</MenuItem>
          {availableYears.map(y => (
            <MenuItem key={y} value={String(y)}>Archives {y}</MenuItem>
          ))}
        </Select>
        <Select
          value={filterStatut}
          onChange={e => setFilterStatut(e.target.value)}
          size="small"
          sx={{
            ...inputSx,
            '& .MuiSelect-select': { color: '#fff' },
            minWidth: 150,
          }}
        >
          {['Tous', 'Draft', 'En attente', 'Payée', 'Rejetée'].map(s => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* ── Tableau ── */}
      <TableContainer component={Paper} className="bento-card" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              {[t('invoices.table.number'), t('invoices.table.date'), t('invoices.table.client'), t('invoices.table.totalTTC'), t('invoices.table.status'), 'Validé', t('invoices.table.actions')].map(h => (
                <TableCell
                  key={h}
                  align={h === 'Total TTC' || h === 'Actions' ? 'right' : 'left'}
                  sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1, color: 'rgba(255,255,255,0.6)' }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFactures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'rgba(255,255,255,0.4)' }}>
                  {t('invoices.noInvoices')}
                </TableCell>
              </TableRow>
            ) : (
              filteredFactures.map(facture => (
                <TableRow
                  key={facture.id}
                  sx={{ cursor: 'pointer', '&:hover': { background: 'rgba(255,255,255,0.03)' } }}
                >
                  <TableCell sx={{ fontWeight: 600, color: '#D4A853' }}>
                    {facture.numero}
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {new Date(facture.date_creation).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>
                    {getClientName(facture.client_id)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#fff' }}>
                    {formatMoney(facture.total_ttc, devise)}
                  </TableCell>
                  <TableCell>
                    <Chip label={facture.statut} color={statusColor(facture.statut)} size="small" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    {facture.validated_by_admin
                      ? <Chip label="✓" color="success" size="small" variant="outlined" />
                      : <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>—</Typography>
                    }
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/factures/${facture.id}`)}
                      sx={{ color: '#D4A853', '&:hover': { background: 'rgba(212,168,83,0.1)' } }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/factures/edit/${facture.id}`)}
                      sx={{ color: '#60a5fa', '&:hover': { background: 'rgba(96,165,250,0.1)' } }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadPDF(facture)}
                      sx={{ color: '#4ade80', '&:hover': { background: 'rgba(74,222,128,0.1)' } }}
                    >
                      <GetApp fontSize="small" />
                    </IconButton>
                    {isAdmin && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(facture)}
                        sx={{ color: '#ef4444', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Archive Modal ── */}
      <ArchiveModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        factures={factures}
        clients={clients}
        parametres={parametres}
      />
    </Box>
  );
};
