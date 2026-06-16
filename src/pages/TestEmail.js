import { useState } from 'react';
import { Box, Paper, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { Send, CheckCircle, Error } from '@mui/icons-material';
import emailjs from '@emailjs/browser';

export const TestEmail = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

  const testEmailJS = async () => {
    setTesting(true);
    setResult(null);

    // Vérification des variables
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      setResult({
        success: false,
        message: 'Variables d\'environnement manquantes',
        details: {
          SERVICE_ID: SERVICE_ID ? '✅' : '❌',
          TEMPLATE_ID: TEMPLATE_ID ? '✅' : '❌',
          PUBLIC_KEY: PUBLIC_KEY ? '✅' : '❌'
        },
        solution: 'Vérifiez le fichier .env et redémarrez l\'application'
      });
      setTesting(false);
      return;
    }

    // Test d'envoi
    try {
      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          to_email: 'test@example.com',
          to_name: 'Test Client',
          from_name: 'Test Société',
          from_email: 'contact@test.com',
          reply_to: 'contact@test.com',
          invoice_number: 'TEST-001',
          invoice_date: new Date().toLocaleDateString('fr-FR'),
          invoice_due: new Date().toLocaleDateString('fr-FR'),
          invoice_status: 'Test',
          invoice_total: '1000.00 MAD',
          invoice_articles: '  - Test Article × 1 = 1000.00 MAD',
          company_name: 'Test Société',
          company_email: 'contact@test.com',
          company_tel: '+212 5 22 00 00 00',
          company_address: 'Test Address',
          company_siret: 'TEST123',
          message: 'Ceci est un email de test pour vérifier la configuration EmailJS.'
        },
        PUBLIC_KEY
      );

      setResult({
        success: true,
        message: 'Email de test envoyé avec succès!',
        details: {
          status: response.status,
          text: response.text,
          SERVICE_ID,
          TEMPLATE_ID
        },
        solution: 'La configuration fonctionne! L\'envoi automatique devrait marcher.'
      });
    } catch (error) {
      let solution = '';
      let errorType = '';

      if (error.text?.includes('Service ID')) {
        errorType = 'Service ID invalide';
        solution = `Le Service ID "${SERVICE_ID}" n'existe pas ou est désactivé. Vérifiez sur https://dashboard.emailjs.com/admin/services`;
      } else if (error.text?.includes('Template')) {
        errorType = 'Template ID invalide';
        solution = `Le Template ID "${TEMPLATE_ID}" n'existe pas. Vérifiez sur https://dashboard.emailjs.com/admin/templates`;
      } else if (error.text?.includes('Public Key') || error.text?.includes('API key')) {
        errorType = 'Public Key invalide';
        solution = `La Public Key "${PUBLIC_KEY}" est incorrecte. Vérifiez sur https://dashboard.emailjs.com/admin/account`;
      } else if (error.text?.includes('quota') || error.text?.includes('limit')) {
        errorType = 'Limite atteinte';
        solution = 'Vous avez dépassé la limite de 200 emails/mois (plan gratuit)';
      } else {
        errorType = 'Erreur réseau';
        solution = 'Vérifiez votre connexion internet et réessayez';
      }

      setResult({
        success: false,
        message: `Erreur: ${errorType}`,
        details: {
          error: error.text || error.message,
          SERVICE_ID,
          TEMPLATE_ID,
          PUBLIC_KEY: PUBLIC_KEY?.substring(0, 10) + '...'
        },
        solution
      });
    }

    setTesting(false);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', mb: 3 }}>
        🔧 Test de Configuration EmailJS
      </Typography>

      <Paper sx={{ p: 3, mb: 3, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="h6" sx={{ color: '#D4A853', mb: 2 }}>
          Variables d'environnement
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            SERVICE_ID: {SERVICE_ID ? <span style={{ color: '#4ade80' }}>✅ {SERVICE_ID}</span> : <span style={{ color: '#ef4444' }}>❌ Non défini</span>}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            TEMPLATE_ID: {TEMPLATE_ID ? <span style={{ color: '#4ade80' }}>✅ {TEMPLATE_ID}</span> : <span style={{ color: '#ef4444' }}>❌ Non défini</span>}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            PUBLIC_KEY: {PUBLIC_KEY ? <span style={{ color: '#4ade80' }}>✅ {PUBLIC_KEY.substring(0, 10)}...</span> : <span style={{ color: '#ef4444' }}>❌ Non défini</span>}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={testing ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <Send />}
          onClick={testEmailJS}
          disabled={testing}
          sx={{
            background: 'linear-gradient(135deg,#D4A853,#F4D03F)',
            color: '#080807',
            fontWeight: 700,
            '&:hover': {
              background: 'linear-gradient(135deg,#F4D03F,#D4A853)',
            }
          }}
        >
          {testing ? 'Test en cours...' : 'Tester l\'envoi d\'email'}
        </Button>
      </Paper>

      {result && (
        <Paper sx={{
          p: 3,
          background: result.success ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${result.success ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {result.success ? (
              <CheckCircle sx={{ color: '#4ade80', fontSize: 40 }} />
            ) : (
              <Error sx={{ color: '#ef4444', fontSize: 40 }} />
            )}
            <Typography variant="h6" sx={{ color: result.success ? '#4ade80' : '#ef4444', fontWeight: 700 }}>
              {result.message}
            </Typography>
          </Box>

          {result.details && (
            <Alert severity={result.success ? 'success' : 'error'} sx={{ mb: 2 }}>
              <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {Object.entries(result.details).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                  </div>
                ))}
              </Typography>
            </Alert>
          )}

          {result.solution && (
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Solution:</strong> {result.solution}
              </Typography>
            </Alert>
          )}

          {!result.success && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                <strong>Actions à faire:</strong>
              </Typography>
              <ol style={{ color: 'rgba(255,255,255,0.7)', marginLeft: 20 }}>
                <li>Ouvrez le dashboard EmailJS: <a href="https://dashboard.emailjs.com" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>https://dashboard.emailjs.com</a></li>
                <li>Vérifiez que votre service email existe et est actif</li>
                <li>Vérifiez que votre template existe avec toutes les variables</li>
                <li>Copiez les bonnes clés (Service ID, Template ID, Public Key)</li>
                <li>Mettez à jour le fichier <code>.env</code> à la racine du projet</li>
                <li>Redémarrez l'application avec <code>DEMARRER_APPLICATION.cmd</code></li>
                <li>Revenez ici et cliquez à nouveau sur "Tester l'envoi d'email"</li>
              </ol>
            </Box>
          )}
        </Paper>
      )}

      <Paper sx={{ p: 3, mt: 3, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)' }}>
        <Typography variant="h6" sx={{ color: '#60a5fa', mb: 2 }}>
          ℹ️ Informations
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', mb: 1 }}>
          Ce test envoie un email de démonstration à test@example.com pour vérifier que EmailJS fonctionne correctement.
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
          Si le test réussit, l'envoi automatique d'emails depuis les factures fonctionnera aussi.
        </Typography>
      </Paper>
    </Box>
  );
};
