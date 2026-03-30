import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Divider
} from '@mui/material';
import { Add, Delete, ArrowBack, Save, Send } from '@mui/icons-material';
import { getClients, addFacture, getFactureById, updateFacture } from '../services/firebaseService';
import { getArticles, getCategories } from '../services/jsonService';
import { AnimatedCard } from '../components/AnimatedCard';

export const FactureForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    numero: '',
    date_creation: new Date().toISOString().split('T')[0],
    date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client_id: '',
    articles: [],
    statut: 'Draft',
    notes: ''
  });
  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, rate: 0, total: 0 }
  ]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const [clientsData, articlesData, categoriesData] = await Promise.all([
      getClients(),
      getArticles(),
      getCategories()
    ]);
    setClients(clientsData);
    setArticles(articlesData);
    setCategories(categoriesData);

    if (id) {
      const facture = await getFactureById(id);
      if (facture) {
        setFormData({
          ...facture,
          articles: facture.articles || [],
          date_creation: facture.date_creation.split('T')[0]
        });
        if (facture.articles && facture.articles.length > 0) {
          setLineItems(facture.articles.map(a => ({
            description: a.designation,
            quantity: a.quantite,
            rate: a.prix_unitaire,
            total: a.quantite * a.prix_unitaire
          })));
        }
      }
    } else {
      generateNumero();
    }
  };

  const generateNumero = () => {
    const date = new Date();
    const numero = `INV-${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, numero }));
  };

  const handleAddLine = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, total: 0 }]);
  };

  const handleRemoveLine = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...lineItems];
    newLines[index][field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      newLines[index].total = newLines[index].quantity * newLines[index].rate;
    }
    
    setLineItems(newLines);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.20; // 20% TVA
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (status = 'Draft') => {
    const articlesData = lineItems.map(item => ({
      designation: item.description,
      quantite: item.quantity,
      prix_unitaire: item.rate,
      tva: 20
    }));

    const factureData = {
      ...formData,
      articles: articlesData,
      statut: status === 'send' ? 'En attente' : 'Draft',
      total_ht: calculateSubtotal(),
      tva: calculateTax(),
      total_ttc: calculateTotal(),
      date_creation: new Date(formData.date_creation).toISOString()
    };

    if (id) {
      await updateFacture(id, factureData);
    } else {
      await addFacture(factureData);
    }

    navigate('/factures');
  };

  const selectedClient = clients.find(c => c.id === formData.client_id);

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton
              onClick={() => navigate('/factures')}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
                New Invoice
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Draft · Not saved
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={() => handleSubmit('draft')}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontWeight: 600,
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  background: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={() => handleSubmit('send')}
              sx={{
                background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
                color: '#080807',
                fontWeight: 700,
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #F4D03F 0%, #D4A853 100%)',
                }
              }}
            >
              Send Invoice
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Form */}
      <AnimatedCard>
        <Paper 
          className="bento-card" 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          <Grid container spacing={4}>
            {/* FROM Section */}
            <Grid item xs={12} md={6}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  fontWeight: 700,
                  mb: 2,
                  display: 'block'
                }}
              >
                FROM
              </Typography>
              <TextField
                fullWidth
                placeholder="Your Name / Company"
                defaultValue="Facture.net"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    '& fieldset': { border: 'none' },
                    '&:hover': { background: 'rgba(255, 255, 255, 0.04)' },
                    '&.Mui-focused': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(212, 168, 83, 0.3)',
                    }
                  }
                }}
              />
              <TextField
                fullWidth
                placeholder="Email address"
                defaultValue="contact@facture.net"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    '& fieldset': { border: 'none' },
                    '&:hover': { background: 'rgba(255, 255, 255, 0.04)' },
                    '&.Mui-focused': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(212, 168, 83, 0.3)',
                    }
                  }
                }}
              />
              <TextField
                fullWidth
                placeholder="Address"
                multiline
                rows={2}
                defaultValue="123 Business Street, Paris, France"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    '& fieldset': { border: 'none' },
                    '&:hover': { background: 'rgba(255, 255, 255, 0.04)' },
                    '&.Mui-focused': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(212, 168, 83, 0.3)',
                    }
                  }
                }}
              />
            </Grid>

            {/* BILL TO Section */}
            <Grid item xs={12} md={6}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  fontWeight: 700,
                  mb: 2,
                  display: 'block'
                }}
              >
                BILL TO
              </Typography>
              <FormControl 
                fullWidth 
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    '& fieldset': { border: 'none' },
                    '&:hover': { background: 'rgba(255, 255, 255, 0.04)' },
                    '&.Mui-focused': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(212, 168, 83, 0.3)',
                    }
                  }
                }}
              >
                <Select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  displayEmpty
                  sx={{ color: formData.client_id ? '#fff' : 'rgba(255, 255, 255, 0.5)' }}
                >
                  <MenuItem value="" disabled>
                    Select client...
                  </MenuItem>
                  {clients.map(client => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedClient && (
                <>
                  <TextField
                    fullWidth
                    value={selectedClient.email || ''}
                    disabled
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        '& fieldset': { border: 'none' },
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    value={selectedClient.adresse || ''}
                    disabled
                    multiline
                    rows={2}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        '& fieldset': { border: 'none' },
                      }
                    }}
                  />
                </>
              )}
            </Grid>

            {/* Invoice Details */}
            <Grid item xs={12}>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 1 }}>
                Invoice Number
              </Typography>
              <TextField
                fullWidth
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    '& fieldset': { border: 'none' },
                    '&:hover': { background: 'rgba(255, 255, 255, 0.04)' },
                    '&.Mui-focused': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(212, 168, 83, 0.3)',
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 1 }}>
                Issue Date
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={formData.date_creation}
                onChange={(e) => setFormData({ ...formData, date_creation: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    '& fieldset': { border: 'none' },
                    '&:hover': { background: 'rgba(255, 255, 255, 0.04)' },
                    '&.Mui-focused': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(212, 168, 83, 0.3)',
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', mb: 1 }}>
                Due Date
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={formData.date_echeance}
                onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    '& fieldset': { border: 'none' },
                    '&:hover': { background: 'rgba(255, 255, 255, 0.04)' },
                    '&.Mui-focused': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(212, 168, 83, 0.3)',
                    }
                  }
                }}
              />
            </Grid>

            {/* Line Items */}
            <Grid item xs={12}>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 2 }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  fontWeight: 700,
                  mb: 3,
                  display: 'block'
                }}
              >
                DESCRIPTION
              </Typography>

              {lineItems.map((item, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      placeholder="Service or product description"
                      value={item.description}
                      onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          '& fieldset': { border: 'none' },
                          '&:hover': { background: 'rgba(255, 255, 255, 0.04)' },
                          '&.Mui-focused': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(212, 168, 83, 0.3)',
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={4} md={2}>
                    <TextField
                      fullWidth
                      type="number"
                      placeholder="QTY"
                      value={item.quantity}
                      onChange={(e) => handleLineChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          '& fieldset': { border: 'none' },
                          '&:hover': { background: 'rgba(255, 255, 255, 0.04)' },
                          '&.Mui-focused': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(212, 168, 83, 0.3)',
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={4} md={2}>
                    <TextField
                      fullWidth
                      type="number"
                      placeholder="RATE (€)"
                      value={item.rate}
                      onChange={(e) => handleLineChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          '& fieldset': { border: 'none' },
                          '&:hover': { background: 'rgba(255, 255, 255, 0.04)' },
                          '&.Mui-focused': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(212, 168, 83, 0.3)',
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={3} md={2}>
                    <Box 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center',
                        px: 2,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>
                        €{item.total.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={1} md={1}>
                    <IconButton
                      onClick={() => handleRemoveLine(index)}
                      disabled={lineItems.length === 1}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        '&:hover': {
                          color: '#ef4444',
                          background: 'rgba(239, 68, 68, 0.1)',
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}

              <Button
                startIcon={<Add />}
                onClick={handleAddLine}
                sx={{
                  color: '#D4A853',
                  textTransform: 'none',
                  fontWeight: 600,
                  mt: 2,
                  '&:hover': {
                    background: 'rgba(212, 168, 83, 0.1)',
                  }
                }}
              >
                Add line item
              </Button>
            </Grid>

            {/* Totals */}
            <Grid item xs={12}>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 3 }} />
              <Box display="flex" justifyContent="flex-end">
                <Box sx={{ minWidth: 300 }}>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Subtotal
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>
                      €{calculateSubtotal().toFixed(2)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Tax (20%)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>
                      €{calculateTax().toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 2 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                      Total
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#D4A853' }}>
                      €{calculateTotal().toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </AnimatedCard>
    </Box>
  );
};
