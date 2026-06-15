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
import { getFactures, getClients } from '../services/firebaseService';
import { notify } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import { AnimatedCard, Card3D } from '../components/AnimatedCard';

export const Dashboard = () => {
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    outstanding: 0,
    invoicesSent: 0,
    activeClients: 0,
    rejectedInvoices: 0,
    rejectedAmount: 0,
    averageInvoice: 0,
    revenueChange: 12.4,
    outstandingChange: -3.1,
    invoicesChange: 8,
    clientsChange: 2
  });
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const calculateStats = (facturesData, clientsData) => {
      const totalRevenue = facturesData
        .filter(f => f.statut === 'Payée')
        .reduce((sum, f) => sum + (f.total_ttc || 0), 0);

      const outstanding = facturesData
        .filter(f => f.statut === 'En attente')
        .reduce((sum, f) => sum + (f.total_ttc || 0), 0);

      const rejectedInvoices = facturesData.filter(f => f.statut === 'Rejetée').length;
      const rejectedAmount = facturesData
        .filter(f => f.statut === 'Rejetée')
        .reduce((sum, f) => sum + (f.total_ttc || 0), 0);

      const averageInvoice = facturesData.length > 0
        ? facturesData.reduce((sum, f) => sum + (f.total_ttc || 0), 0) / facturesData.length
        : 0;

      setStats({
        totalRevenue,
        outstanding,
        invoicesSent: facturesData.length,
        activeClients: clientsData.length,
        rejectedInvoices,
        rejectedAmount,
        averageInvoice,
        revenueChange: 12.4,
        outstandingChange: -3.1,
        invoicesChange: 8,
        clientsChange: 2
      });
    };

    const loadData = async () => {
      const [facturesData, clientsData] = await Promise.all([
        getFactures(),
        getClients()
      ]);
      setFactures(facturesData);
      setClients(clientsData);
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
    const client = clients.find(c => c.id === clientId);
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
      label: 'Create Invoice',
      action: () => navigate('/factures/nouvelle')
    },
    {
      icon: <People />,
      label: 'Add Client',
      action: () => navigate('/clients'),
      adminOnly: true
    },
    {
      icon: <Assessment />,
      label: 'View Reports',
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
              Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Sunday, March 15, 2026
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
              Nouvelle Facture
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
                JD
              </Avatar>
            )}
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Revenue"
            value={`€${stats.totalRevenue.toLocaleString()}`}
            change={stats.revenueChange}
            icon={TrendingUp}
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Outstanding"
            value={`€${stats.outstanding.toLocaleString()}`}
            change={stats.outstandingChange}
            icon={TrendingDown}
            delay={100}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Invoices Sent"
            value={stats.invoicesSent}
            change={stats.invoicesChange}
            icon={Receipt}
            delay={200}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Average Invoice"
            value={`€${stats.averageInvoice.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
            change={5.2}
            icon={Assessment}
            delay={300}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Active Clients"
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
                  Chiffre d'Affaires Mensuel
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
                    Recent Invoices
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
                    View all
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
                          {facture.numero} · {new Date(facture.date_creation).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                          €{facture.total_ttc?.toFixed(2)}
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
                    Quick Actions
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
                    Payment Status
                  </Typography>
                  <Box>
                    {[
                      { label: 'Paid', value: 68, color: '#4ade80' },
                      { label: 'Pending', value: 20, color: '#fbbf24' },
                      { label: 'Overdue', value: 12, color: '#ef4444' }
                    ].map((status, index) => (
                      <Box key={index} sx={{ mb: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                            {status.label}
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
