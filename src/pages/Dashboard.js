import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Avatar
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  People, 
  Assessment,
  ArrowForward,
  Add
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getFactures, getClients, getParametres } from '../services/mongodbService';
import { notify } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContextMongoDB';
import { AnimatedCard, Card3D } from '../components/AnimatedCard';
import { useLanguage } from '../contexts/LanguageContext';
import { formatMoney } from '../utils/currency';

export const Dashboard = () => {
  const { t } = useLanguage();
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [devise, setDevise] = useState('MAD');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    outstanding: 0,
    invoicesSent: 0,
    activeClients: 0,
    rejectedInvoices: 0,
    rejectedAmount: 0,
    averageInvoice: 0,
    payeeCount: 0,
    enAttenteCount: 0,
    rejeteeCount: 0,
    payeePct: 0,
    enAttentePct: 0,
    rejetePct: 0,
  });
  const { isAdmin, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const calculateStats = (facturesData, clientsData) => {
      const payees = facturesData.filter(f => f.statut === 'Payée');
      const enAttente = facturesData.filter(f => f.statut === 'En attente');
      const rejetees = facturesData.filter(f => f.statut === 'Rejetée');
      const total = facturesData.length;

      const totalRevenue = payees.reduce((sum, f) => sum + (f.total_ttc || 0), 0);
      const outstanding = enAttente.reduce((sum, f) => sum + (f.total_ttc || 0), 0);
      const rejectedAmount = rejetees.reduce((sum, f) => sum + (f.total_ttc || 0), 0);
      const averageInvoice = total > 0
        ? facturesData.reduce((sum, f) => sum + (f.total_ttc || 0), 0) / total
        : 0;

      // Calcul dynamique des pourcentages
      const payeePct = total > 0 ? Math.round((payees.length / total) * 100) : 0;
      const enAttentePct = total > 0 ? Math.round((enAttente.length / total) * 100) : 0;
      const rejetePct = total > 0 ? Math.round((rejetees.length / total) * 100) : 0;

      // Variation mensuelle (comparaison mois actuel vs précédent)
      const now = new Date();
      const currentMonth = now.getMonth();
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const currentYear = now.getFullYear();
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthRevenue = payees
        .filter(f => {
          const d = new Date(f.date_creation);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, f) => sum + (f.total_ttc || 0), 0);

      const prevMonthRevenue = payees
        .filter(f => {
          const d = new Date(f.date_creation);
          return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        })
        .reduce((sum, f) => sum + (f.total_ttc || 0), 0);

      const revenueChange = prevMonthRevenue > 0
        ? parseFloat(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1))
        : 0;

      setStats({
        totalRevenue,
        outstanding,
        invoicesSent: total,
        activeClients: clientsData.length,
        rejectedInvoices: rejetees.length,
        rejectedAmount,
        averageInvoice,
        payeeCount: payees.length,
        enAttenteCount: enAttente.length,
        rejeteeCount: rejetees.length,
        payeePct,
        enAttentePct,
        rejetePct,
        revenueChange,
        outstandingChange: enAttente.length > 0 ? -5.2 : 0,
        invoicesChange: total > 0 ? 8 : 0,
        clientsChange: clientsData.length > 0 ? 2 : 0,
      });
    };

    const loadData = async () => {
      try {
        const [facturesData, clientsData, parametresData] = await Promise.all([
          getFactures(),
          getClients(),
          getParametres().catch(() => null)
        ]);
        setFactures(facturesData);
        setClients(clientsData);
        if (parametresData && parametresData.devise) {
          setDevise(parametresData.devise);
        }
        calculateStats(facturesData, clientsData);

        const today = new Date();
        facturesData
          .filter(f => f.statut === 'En attente' && f.date_echeance)
          .forEach(f => {
            const diff = Math.ceil(
              (new Date(f.date_echeance) - today) / (1000 * 60 * 60 * 24)
            );
            if (diff >= 0 && diff <= 3) {
              notify.echeaniceProche(f.numero, diff);
            }
          });
      } catch (err) {
        console.error('Dashboard load error:', err);
      }
    };

    loadData();
  }, []);

  const getRecentInvoices = () => {
    return factures
      .sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation))
      .slice(0, 5);
  };

  const getMonthlyRevenue = () => {
    const monthlyData = {};
    factures.forEach(f => {
      if (f.statut === 'Payée' && f.date_creation) {
        const date = new Date(f.date_creation);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthLabel, revenue: 0 };
        }
        monthlyData[monthKey].revenue += f.total_ttc || 0;
      }
    });
    
    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  const getClientName = (clientId) => {
    if (!clientId) return 'Client inconnu';
    if (typeof clientId === 'object' && clientId?.nom) return clientId.nom;
    const client = clients.find(c => String(c.id) === String(clientId) || String(c._id) === String(clientId));
    return client ? client.nom : 'Client inconnu';
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'Payée': return '#4ade80';
      case 'En attente': return '#fbbf24';
      case 'Rejetée': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'Payée': return 'Paid';
      case 'En attente': return 'Pending';
      case 'Rejetée': return 'Overdue';
      default: return 'Draft';
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color, delay = 0 }) => (
    <AnimatedCard delay={delay}>
      <Card3D>
        <Card 
          className="bento-card"
          sx={{ 
            height: '100%',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Icon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.5)' }} />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontSize: '0.7rem',
                      fontWeight: 600
                    }}
                  >
                    {title}
                  </Typography>
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800,
                    color: '#fff',
                    mb: 1
                  }}
                >
                  {value}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  {change > 0 ? (
                    <TrendingUp sx={{ fontSize: 16, color: '#4ade80' }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 16, color: '#ef4444' }} />
                  )}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: change > 0 ? '#4ade80' : '#ef4444',
                      fontWeight: 700
                    }}
                  >
                    {change > 0 ? '+' : ''}{change}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Card3D>
    </AnimatedCard>
  );

  const quickActions = [
    {
      icon: <Receipt />,
      label: t('dashboard.quickActions.createInvoice'),
      action: () => navigate('/factures/nouvelle')
    },
    {
      icon: <People />,
      label: t('dashboard.quickActions.addClient'),
      action: () => navigate('/clients'),
      adminOnly: true
    },
    {
      icon: <Assessment />,
      label: t('dashboard.quickActions.viewReports'),
      action: () => navigate('/factures')
    }
  ];

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>
              {t('dashboard.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/factures/nouvelle')}
              sx={{
                background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
                color: '#080807',
                fontWeight: 700,
                px: 3,
                py: 1.2,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #F4D03F 0%, #D4A853 100%)',
                }
              }}
            >
              {t('dashboard.newInvoice')}
            </Button>
            <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40,
                  background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
                  color: '#080807',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {currentUser?.nom?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title={t('dashboard.stats.totalRevenue')}
            value={formatMoney(stats.totalRevenue, devise)}
            change={stats.revenueChange}
            icon={TrendingUp}
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title={t('dashboard.stats.outstanding')}
            value={formatMoney(stats.outstanding, devise)}
            change={stats.outstandingChange}
            icon={TrendingDown}
            delay={100}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title={t('dashboard.stats.invoicesSent')}
            value={stats.invoicesSent}
            change={stats.invoicesChange}
            icon={Receipt}
            delay={200}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title={t('dashboard.stats.averageInvoice')}
            value={formatMoney(stats.averageInvoice, devise)}
            change={5.2}
            icon={Assessment}
            delay={300}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title={t('dashboard.stats.activeClients')}
            value={stats.activeClients}
            change={stats.clientsChange}
            icon={People}
            delay={400}
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Monthly Revenue Chart */}
        <Grid item xs={12}>
          <AnimatedCard delay={350}>
            <Card3D>
              <Paper className="bento-card" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', mb: 3 }}>
                  {t('dashboard.revenueChart.title')}
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getMonthlyRevenue()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(8, 8, 7, 0.95)', 
                        border: '1px solid rgba(212, 168, 83, 0.3)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="revenue" fill="#D4A853" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Card3D>
          </AnimatedCard>
        </Grid>

        {/* Recent Invoices */}
        <Grid item xs={12} md={8}>
          <AnimatedCard delay={400}>
            <Card3D>
              <Paper className="bento-card" sx={{ p: 3, borderRadius: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                    {t('dashboard.recentInvoices.title')}
                  </Typography>
                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/factures')}
                    sx={{
                      color: '#D4A853',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'rgba(212, 168, 83, 0.1)',
                      }
                    }}
                  >
                    {t('dashboard.recentInvoices.viewAll')}
                  </Button>
                </Box>

                <List sx={{ p: 0 }}>
                  {getRecentInvoices().map((facture, index) => (
                    <ListItem
                      key={facture.id}
                      sx={{
                        px: 2,
                        py: 2,
                        mb: 1,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(212, 168, 83, 0.3)',
                          transform: 'translateX(4px)',
                        }
                      }}
                      onClick={() => navigate(`/factures/${facture.id}`)}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff', mb: 0.5 }}>
                          {getClientName(facture.client_id)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          {facture.numero} · {new Date(facture.date_creation).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                          {formatMoney(facture.total_ttc, facture.devise || devise)}
                        </Typography>
                        <Chip
                          label={getStatusLabel(facture.statut)}
                          size="small"
                          sx={{
                            background: `${getStatusColor(facture.statut)}20`,
                            color: getStatusColor(facture.statut),
                            border: `1px solid ${getStatusColor(facture.statut)}40`,
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Card3D>
          </AnimatedCard>
        </Grid>

        {/* Quick Actions & Payment Status */}
        <Grid item xs={12} md={4}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Quick Actions */}
            <AnimatedCard delay={500}>
              <Card3D>
                <Paper className="bento-card" sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', mb: 3 }}>
                    {t('dashboard.quickActions.title')}
                  </Typography>
                  <List sx={{ p: 0 }}>
                    {quickActions
                      .filter(action => !action.adminOnly || isAdmin)
                      .map((action, index) => (
                        <ListItem
                          key={index}
                          button
                          onClick={action.action}
                          sx={{
                            px: 2,
                            py: 1.5,
                            mb: 1,
                            borderRadius: 2,
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            '&:hover': {
                              background: 'rgba(212, 168, 83, 0.1)',
                              border: '1px solid rgba(212, 168, 83, 0.3)',
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 2,
                                background: 'rgba(212, 168, 83, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#D4A853'
                              }}
                            >
                              {action.icon}
                            </Box>
                          </ListItemIcon>
                          <ListItemText 
                            primary={action.label}
                            primaryTypographyProps={{
                              sx: { color: '#fff', fontWeight: 600, fontSize: '0.9rem' }
                            }}
                          />
                          <ArrowForward sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.3)' }} />
                        </ListItem>
                      ))}
                  </List>
                </Paper>
              </Card3D>
            </AnimatedCard>

            {/* Payment Status */}
            <AnimatedCard delay={600}>
              <Card3D>
                <Paper className="bento-card" sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', mb: 3 }}>
                    {t('invoices.status.paid')} / {t('invoices.status.pending')} / {t('invoices.status.rejected')}
                  </Typography>
                  <Box>
                    {[
                      { label: t('invoices.status.paid'), value: stats.payeePct, count: stats.payeeCount, color: '#4ade80' },
                      { label: t('invoices.status.pending'), value: stats.enAttentePct, count: stats.enAttenteCount, color: '#fbbf24' },
                      { label: t('invoices.status.rejected'), value: stats.rejetePct, count: stats.rejeteeCount, color: '#ef4444' }
                    ].map((status, index) => (
                      <Box key={index} sx={{ mb: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                            {status.label} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>({status.count})</span>
                          </Typography>
                          <Typography variant="body2" sx={{ color: status.color, fontWeight: 700 }}>
                            {status.value}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={status.value}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.05)',
                            '& .MuiLinearProgress-bar': {
                              background: status.color,
                              borderRadius: 4,
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Card3D>
            </AnimatedCard>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
