import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  IconButton,
  Divider
} from '@mui/material';
import { Add, Delete, ArrowBack, Save, Send } from '@mui/icons-material';
import { getClients, addFacture, getFactureById, updateFacture, getArticles, getCategories, getParametres } from '../services/mongodbService';
import { notify } from '../services/notificationService';
import { AnimatedCard } from '../components/AnimatedCard';
import { useLanguage } from '../contexts/LanguageContext';
import { formatMoney } from '../utils/currency';

export const FactureForm = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [devise, setDevise] = useState('MAD');
  const [formData, setFormData] = useState({
    numero: '',
    date_creation: new Date().toISOString().split('T')[0],
    date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client_id: '',
    devise: 'MAD',
    articles: [],
    statut: 'Draft',
    notes: '',
    remise_globale: 0,
    mode_paiement: '',
    date_depot: '',
    date_encaissement: '',
    type_virement: ''
  });
  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, rate: 0, discount: 0, total: 0, article_id: '' }
  ]);

  useEffect(() => {
    const loadData = async () => {
      const [clientsData, categoriesData, articlesData, parametresData] = await Promise.all([
        getClients(),
        getCategories(),
        getArticles(),
        getParametres().catch(() => null),
      ]);
      setClients(clientsData);
      setCategories(categoriesData);
      setArticles(articlesData);
      if (parametresData && parametresData.devise) {
        setDevise(parametresData.devise);
        setFormData(prev => ({ ...prev, devise: parametresData.devise }));
      }

      const clientIdFromUrl = searchParams.get('client');
      if (clientIdFromUrl && !id) {
        setFormData(prev => ({ ...prev, client_id: clientIdFromUrl }));
      }

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
              discount: a.remise || 0,
              categorie_id: a.categorie_id,
              tva: a.tva,
              total: a.quantite * a.prix_unitaire * (1 - (a.remise || 0) / 100),
              article_id: ''
            })));
          }
        }
      } else {
        const date = new Date();
        const numero = `INV-${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, numero }));
      }
    };

    loadData();
  }, [id, searchParams]);

  const handleAddLine = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, discount: 0, categorie_id: '', tva: 20, total: 0, article_id: '' }]);
  };

  const handleRemoveLine = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Retourne le taux TVA de la catégorie sélectionnée (défaut 20%)
  const getTVAForCategory = (catId) => {
    const cat = categories.find(c => String(c.id) === String(catId));
    return cat ? (cat.tva ?? 20) : 20;
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...lineItems];
    newLines[index][field] = value;

    // Si on sélectionne un article existant, remplir automatiquement les champs
    if (field === 'article_id' && value) {
      const selectedArticle = articles.find(a => a.id === value || a._id === value);
      if (selectedArticle) {
        newLines[index].description = selectedArticle.designation;
        newLines[index].rate = selectedArticle.prix_unitaire;
        newLines[index].categorie_id = selectedArticle.categorie_id?.id || selectedArticle.categorie_id;
        newLines[index].tva = getTVAForCategory(selectedArticle.categorie_id?.id || selectedArticle.categorie_id);
      }
    }

    // Recalcul selon catégorie si on change la catégorie
    if (field === 'categorie_id') {
      newLines[index].tva = getTVAForCategory(value);
    }

    if (['quantity', 'rate', 'discount', 'categorie_id', 'article_id'].includes(field)) {
      const quantity = parseFloat(newLines[index].quantity) || 0;
      const rate     = parseFloat(newLines[index].rate)     || 0;
      const discount = parseFloat(newLines[index].discount) || 0;
      const subtotal = quantity * rate;
      const discountAmount = subtotal * (discount / 100);
      newLines[index].total = subtotal - discountAmount;
    }

    setLineItems(newLines);
  };

  const calculateSubtotal = () => {
    const total = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
    return isNaN(total) ? 0 : total;
  };

  const calculateGlobalDiscount = () => {
    const discount = calculateSubtotal() * ((formData.remise_globale || 0) / 100);
    return isNaN(discount) ? 0 : discount;
  };

  const calculateSubtotalAfterDiscount = () => {
    const total = calculateSubtotal() - calculateGlobalDiscount();
    return isNaN(total) ? 0 : total;
  };

  // Calcul TVA pondérée selon les catégories des lignes
  const calculateTax = () => {
    const taxTotal = lineItems.reduce((sum, item) => {
      const lineHT  = parseFloat(item.total) || 0;
      const tvaRate = (item.tva ?? 20) / 100;
      return sum + lineHT * tvaRate;
    }, 0);
    // Applique la proportion de remise globale sur la TVA aussi
    const remisePct = (parseFloat(formData.remise_globale) || 0) / 100;
    const tax = taxTotal * (1 - remisePct);
    return isNaN(tax) ? 0 : tax;
  };

  const calculateTotal = () => {
    const total = calculateSubtotalAfterDiscount() + calculateTax();
    return isNaN(total) ? 0 : total;
  };

  const handleSubmit = async (status = 'Draft') => {
    const articlesData = lineItems.map(item => ({
      designation: item.description || '',
      quantite: parseFloat(item.quantity) || 0,
      prix_unitaire: parseFloat(item.rate) || 0,
      remise: parseFloat(item.discount) || 0,
      tva: item.tva ?? getTVAForCategory(item.categorie_id),
      categorie_id: item.categorie_id || '',
    }));

    const totalHT = calculateSubtotal();
    const remiseGlobale = parseFloat(formData.remise_globale) || 0;
    const remiseMontant = calculateGlobalDiscount();
    const totalApresRemise = calculateSubtotalAfterDiscount();
    const tva = calculateTax();
    const totalTTC = calculateTotal();

    const factureData = {
      ...formData,
      articles: articlesData,
      // En mode édition, garder le statut existant sauf si on envoie explicitement
      statut: id
        ? (status === 'send' ? 'En attente' : formData.statut || 'Draft')
        : (status === 'send' ? 'En attente' : 'Draft'),
      total_ht: totalHT,
      remise_globale: remiseGlobale,
      remise_montant: remiseMontant,
      total_apres_remise: totalApresRemise,
      tva: tva,
      total_ttc: totalTTC,
      devise: devise,
      date_creation: new Date(formData.date_creation).toISOString()
    };

    // Nettoyer les champs ObjectId vides pour éviter erreur de cast Mongoose
    if (!factureData.client_id) delete factureData.client_id;
    // Nettoyer categorie_id vide dans les articles
    factureData.articles = factureData.articles.map(a => {
      if (!a.categorie_id) { const { categorie_id, ...rest } = a; return rest; }
      return a;
    });

    if (id) {
      await updateFacture(id, factureData);
      notify.factureModifiee(factureData.numero);
    } else {
      await addFacture(factureData);
      if (status === 'send') {
        notify.factureSoumise(factureData.numero);
      } else {
        notify.factureCreee(factureData.numero);
      }
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
                {id ? t('invoiceForm.title.edit') : t('invoiceForm.title.new')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {id ? t('common.edit') : t('common.loading')}
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
              Enregistrer Brouillon
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
              {t('common.send')} {t('dashboard.newInvoice')}
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
                DE
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
                {t('invoiceForm.sections.client').toUpperCase()}
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
                    {t('invoiceForm.fields.selectClient')}
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
                {t('invoiceForm.fields.invoiceNumber')}
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
                {t('invoiceForm.fields.date')}
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
                {t('invoiceForm.fields.dueDate')}
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
                {t('invoiceForm.sections.articles').toUpperCase()}
              </Typography>

              {lineItems.map((item, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }} alignItems="center">

                  {/* Sélecteur d'article existant OU saisie manuelle */}
                  <Grid item xs={12} md={3}>
                    <Select
                      fullWidth
                      displayEmpty
                      value={item.article_id || ''}
                      onChange={(e) => handleLineChange(index, 'article_id', e.target.value)}
                      sx={{ 
                        borderRadius: 2, 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.08)', 
                        '& fieldset': { border: 'none' }, 
                        color: item.article_id ? '#fff' : 'rgba(255,255,255,0.4)', 
                        fontSize: '0.9rem',
                        mb: 1
                      }}
                    >
                      <MenuItem value="">
                        <em>📦 Sélectionner un article existant...</em>
                      </MenuItem>
                      {articles.map(art => (
                        <MenuItem key={art.id || art._id} value={art.id || art._id}>
                          {art.designation} — {art.prix_unitaire} {devise}
                        </MenuItem>
                      ))}
                    </Select>
                    <TextField
                      fullWidth
                      placeholder="OU entrer manuellement"
                      value={item.description}
                      onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', '& fieldset': { border: 'none' }, '&.Mui-focused': { border: '1px solid rgba(212,168,83,0.3)' } } }}
                    />
                  </Grid>

                  {/* Catégorie + TVA auto */}
                  <Grid item xs={6} md={2}>
                    <Select
                      fullWidth
                      displayEmpty
                      value={item.categorie_id || ''}
                      onChange={(e) => handleLineChange(index, 'categorie_id', e.target.value)}
                      sx={{ borderRadius: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', '& fieldset': { border: 'none' }, color: item.categorie_id ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}
                    >
                      <MenuItem value="" disabled><em>Catégorie</em></MenuItem>
                      {categories.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.nom} ({cat.tva}%)
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>

                  {/* Qté */}
                  <Grid item xs={3} md={1}>
                    <TextField
                      fullWidth type="number" placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => handleLineChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', '& fieldset': { border: 'none' }, '&.Mui-focused': { border: '1px solid rgba(212,168,83,0.3)' } } }}
                    />
                  </Grid>

                  {/* Prix */}
                  <Grid item xs={4} md={2}>
                    <TextField
                      fullWidth type="number" placeholder={`Prix ${devise}`}
                      value={item.rate}
                      onChange={(e) => handleLineChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', '& fieldset': { border: 'none' }, '&.Mui-focused': { border: '1px solid rgba(212,168,83,0.3)' } } }}
                    />
                  </Grid>

                  {/* Remise % */}
                  <Grid item xs={3} md={1}>
                    <TextField
                      fullWidth type="number" placeholder="Rem%"
                      value={item.discount}
                      onChange={(e) => handleLineChange(index, 'discount', parseFloat(e.target.value) || 0)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', '& fieldset': { border: 'none' }, '&.Mui-focused': { border: '1px solid rgba(212,168,83,0.3)' } } }}
                    />
                  </Grid>

                  {/* Total ligne */}
                  <Grid item xs={4} md={2}>
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', px: 2, borderRadius: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', minHeight: 56 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', fontSize: '0.7rem' }}>
                          TVA {item.tva ?? 20}%
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#D4A853' }}>
                          {formatMoney(item.total, devise)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Supprimer */}
                  <Grid item xs={1} md={1}>
                    <IconButton
                      onClick={() => handleRemoveLine(index)}
                      disabled={lineItems.length === 1}
                      sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#ef4444', background: 'rgba(239,68,68,0.1)' } }}
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
                {t('invoiceForm.buttons.addArticle')}
              </Button>
            </Grid>

            {/* Totals */}
            <Grid item xs={12}>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 3 }} />
              <Box display="flex" justifyContent="flex-end">
                <Box sx={{ minWidth: 400 }}>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {t('invoiceDetail.fields.totalHT')}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>
                      {formatMoney(calculateSubtotal(), devise)}
                    </Typography>
                  </Box>
                  
                  {/* Remise Globale */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {t('invoiceDetail.fields.globalDiscount')}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TextField
                        type="number"
                        value={formData.remise_globale}
                        onChange={(e) => setFormData({ ...formData, remise_globale: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        sx={{
                          width: 80,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            '& fieldset': { border: 'none' },
                            '& input': { textAlign: 'right', padding: '8px' }
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', width: 20 }}>
                        %
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#ef4444', minWidth: 100, textAlign: 'right' }}>
                        -{formatMoney(calculateGlobalDiscount(), devise)}
                      </Typography>
                    </Box>
                  </Box>

                  {formData.remise_globale > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {t('invoiceDetail.fields.afterDiscount')}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>
                        {formatMoney(calculateSubtotalAfterDiscount(), devise)}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {t('invoiceDetail.fields.totalVAT')} (20%)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>
                      {formatMoney(calculateTax(), devise)}
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 2 }} />
                  <Box display="flex" justifyContent="space-between" mb={3}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                      {t('invoiceDetail.fields.totalTTC')}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#D4A853' }}>
                      {formatMoney(calculateTotal(), devise)}
                    </Typography>
                  </Box>

                  {/* Mode de Paiement */}
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 3 }} />
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
                    {t('invoiceForm.fields.paymentMethod').toUpperCase()}
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 1, display: 'block' }}>
                      {t('invoiceForm.fields.paymentMethod')}
                    </Typography>
                    <Select
                      value={formData.mode_paiement}
                      onChange={(e) => setFormData({ ...formData, mode_paiement: e.target.value })}
                      displayEmpty
                      sx={{
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        '& fieldset': { border: 'none' },
                        color: formData.mode_paiement ? '#fff' : 'rgba(255, 255, 255, 0.5)'
                      }}
                    >
                      <MenuItem value="">Sélectionner...</MenuItem>
                      <MenuItem value="Virement bancaire">Virement bancaire</MenuItem>
                      <MenuItem value="Chèque">Chèque</MenuItem>
                      <MenuItem value="Espèces">Espèces</MenuItem>
                      <MenuItem value="Carte bancaire">Carte bancaire</MenuItem>
                      <MenuItem value="Prélèvement">Prélèvement automatique</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 1, display: 'block' }}>
                      {t('invoiceForm.fields.depositDate')}
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      value={formData.date_depot}
                      onChange={(e) => setFormData({ ...formData, date_depot: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          '& fieldset': { border: 'none' }
                        }
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 1, display: 'block' }}>
                      {t('invoiceForm.fields.collectionDate')}
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      value={formData.date_encaissement}
                      onChange={(e) => setFormData({ ...formData, date_encaissement: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          '& fieldset': { border: 'none' }
                        }
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 1, display: 'block' }}>
                      {t('invoiceForm.fields.transferType')}
                    </Typography>
                    <Select
                      fullWidth
                      value={formData.type_virement}
                      onChange={(e) => setFormData({ ...formData, type_virement: e.target.value })}
                      displayEmpty
                      sx={{
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        '& fieldset': { border: 'none' },
                        color: formData.type_virement ? '#fff' : 'rgba(255, 255, 255, 0.5)'
                      }}
                    >
                      <MenuItem value="">Sélectionner...</MenuItem>
                      <MenuItem value="SEPA">SEPA</MenuItem>
                      <MenuItem value="International">International</MenuItem>
                      <MenuItem value="Instantané">Instantané</MenuItem>
                      <MenuItem value="Différé">Différé</MenuItem>
                    </Select>
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
