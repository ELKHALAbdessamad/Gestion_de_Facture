// Test de la configuration EmailJS
import emailjs from '@emailjs/browser';

export const testEmailJSConfiguration = async () => {
  const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

  console.group('🔍 Test Configuration EmailJS');
  
  // 1. Vérifier les variables d'environnement
  console.log('1️⃣ Variables d\'environnement:');
  console.log('   SERVICE_ID:', SERVICE_ID ? '✅ Défini' : '❌ Manquant');
  console.log('   TEMPLATE_ID:', TEMPLATE_ID ? '✅ Défini' : '❌ Manquant');
  console.log('   PUBLIC_KEY:', PUBLIC_KEY ? '✅ Défini' : '❌ Manquant');
  
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.error('❌ Configuration incomplète!');
    console.log('📝 Solution: Vérifiez le fichier .env et redémarrez l\'application');
    console.groupEnd();
    return false;
  }

  // 2. Tester l'envoi d'un email de test
  console.log('\n2️⃣ Test d\'envoi...');
  
  try {
    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: 'test@example.com',
        to_name: 'Test Client',
        from_name: 'Test Société',
        from_email: 'contact@test.com',
        invoice_number: 'TEST-001',
        invoice_date: new Date().toLocaleDateString('fr-FR'),
        invoice_total: '1000.00 MAD',
        message: 'Ceci est un email de test de configuration EmailJS.',
      },
      PUBLIC_KEY
    );

    if (result.status === 200) {
      console.log('✅ Test réussi!');
      console.log('   Status:', result.status);
      console.log('   Message:', result.text);
      console.groupEnd();
      return true;
    } else {
      console.error('❌ Échec du test');
      console.error('   Status:', result.status);
      console.error('   Message:', result.text);
      console.groupEnd();
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:');
    console.error('   Message:', error.message);
    console.error('   Détails:', error);
    
    // Diagnostics supplémentaires
    console.log('\n🔍 Diagnostics:');
    if (error.message.includes('Service ID')) {
      console.log('   ⚠️ Le Service ID semble incorrect');
      console.log('   📝 Vérifiez dans https://dashboard.emailjs.com/admin/services');
    }
    if (error.message.includes('Template')) {
      console.log('   ⚠️ Le Template ID semble incorrect');
      console.log('   📝 Vérifiez dans https://dashboard.emailjs.com/admin/templates');
    }
    if (error.message.includes('Public Key') || error.message.includes('API key')) {
      console.log('   ⚠️ La Public Key semble incorrecte');
      console.log('   📝 Vérifiez dans https://dashboard.emailjs.com/admin/account');
    }
    if (error.message.includes('quota') || error.message.includes('limit')) {
      console.log('   ⚠️ Limite d\'emails atteinte');
      console.log('   📝 Plan gratuit = 200 emails/mois');
    }
    
    console.groupEnd();
    return false;
  }
};

// Fonction pour afficher la configuration actuelle
export const showEmailJSConfig = () => {
  console.group('⚙️ Configuration EmailJS actuelle');
  console.log('SERVICE_ID:', process.env.REACT_APP_EMAILJS_SERVICE_ID || '❌ Non défini');
  console.log('TEMPLATE_ID:', process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '❌ Non défini');
  console.log('PUBLIC_KEY:', process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '❌ Non défini');
  console.log('\n📝 Pour modifier: Éditez le fichier .env à la racine du projet');
  console.groupEnd();
};
