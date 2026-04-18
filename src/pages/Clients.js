import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Add, Search, MoreVert, Receipt } from '@mui/icons-material';
import { getClients, addClient, updateClient, deleteClient, getFactures } from '../services/firebaseService';
import { LordIcon, Icons } from '../components/LordIcon';
import { AnimatedCard, Card3D } from '../components/AnimatedCard';
import { AnimatedInput } from '../components/AnimatedInput';

export const Clients = () => {
  const [clients, setClients] = useState([]);
  const [factures, setFactures] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    tel: '',
    adresse: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [clientsData, facturesData] = await Promise.all([
      getClients(),
      getFactures()
    ]);
    setClients(clientsData);
    setFactures(facturesData);
  };

  const getClientStats = (clientId) => {
    const clientFactures = factures.filter(f => f.client_id === clientId);
    const totalInvoiced = clientFactures.reduce((sum, f) => sum + (f.total_ttc || 0), 0);
    return {
      invoices: clientFactures.length,
      totalInvoiced
    };
  };

  const getClientStatus = (clientId) => {
    const clientFactures = factures.filter(f => f.client_id === clientId);
    const hasActiveInvoices = clientFactures.some(f => f.statut === 'En attente');
    return hasActiveInvoices ? 'Active' : 'Inactive';
  };

  const handleOpen = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        nom: client.nom,
        email: client.email || '',
        tel: client.tel || '',
        adresse: client.adresse || ''
      });
    } else {
      setEditingClient(null);
      setFormData({ nom: '', email: '', tel: '', adresse: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingClient(null);
  };

  const handleSubmit = async () => {
    if (editingClient) {
      await updateClient(editingClient.id, formData);
    } else {
      await addClient(formData);
    }
    handleClose();
    loadData();
  };

  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (index) => {
    const colors = [
      'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
      'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
      'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
      'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'
    ];
    return colors[index % colors.length];
  };

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
              Clients
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              {clients.length} clients
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
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
            Ajouter un Client
          </Button>
        </Box>
      </motion.div>

      {/* Search */}
      <AnimatedCard delay={100}>
        <Box mb={4}>
          <TextField
            fullWidth
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                },
                '&.Mui-focused': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(212, 168, 83, 0.3)',
                }
              }
            }}
          />
        </Box>
      </AnimatedCard>

      {/* Clients Grid */}
      <Grid container spacing={3}>
        {filteredClients.map((client, index) => {
          const stats = getClientStats(client.id);
          const status = getClientStatus(client.id);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <AnimatedCard delay={index * 50}>
                <Card3D>
                  <Card
                    className="bento-card"
                    sx={{
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(212, 168, 83, 0.3)',
                        transform: 'translateY(-4px)',
                      }
                    }}
                    onClick={() => handleOpen(client)}
                  >
                    <CardContent>
                      {/* Header */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            background: getAvatarColor(index),
                            color: '#080807',
                            fontWeight: 700,
                            fontSize: '1.2rem'
                          }}
                        >
                          {getInitials(client.nom)}
                        </Avatar>
                        <Box display="flex" gap={1}>
                          <Chip
                            label={status}
                            size="small"
                            sx={{
                              background: status === 'Active' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                              color: status === 'Active' ? '#4ade80' : '#6b7280',
                              border: `1px solid ${status === 'Active' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`,
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                          <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Client Info */}
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
                        {client.nom}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 0.5 }}>
                        {client.entreprise || 'Acme Corp'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block', mb: 2 }}>
                        {client.email}
                      </Typography>

                      {/* Stats */}
                      <Box 
                        sx={{ 
                          pt: 2, 
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>
                            Total Invoiced
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#D4A853' }}>
                            €{stats.totalInvoiced.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>
                            Invoices
                          </Typography>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Receipt sx={{ fontSize: 16, color: '#fff' }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                              {stats.invoices}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Invoice Button */}
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Add />}
                        sx={{
                          mt: 2,
                          borderColor: 'rgba(212, 168, 83, 0.3)',
                          color: '#D4A853',
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: '#D4A853',
                            background: 'rgba(212, 168, 83, 0.1)',
                          }
                        }}
                      >
                        Invoice
                      </Button>
                    </CardContent>
                  </Card>
                </Card3D>
              </AnimatedCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          className: 'bento-card',
          sx: { 
            borderRadius: 3,
            background: 'rgba(8, 8, 7, 0.95)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#fff' }}>
          {editingClient ? 'Modifier le Client' : 'Ajouter un Nouveau Client'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <AnimatedInput
              label="Client Name"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
            />
            <AnimatedInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <AnimatedInput
              label="Phone"
              value={formData.tel}
              onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
            />
            <AnimatedInput
              label="Adresse"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              borderRadius: 2, 
              px: 3,
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
              color: '#080807',
              '&:hover': {
                background: 'linear-gradient(135deg, #F4D03F 0%, #D4A853 100%)',
              }
            }}
          >
            {editingClient ? 'Enregistrer' : 'Ajouter le Client'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
