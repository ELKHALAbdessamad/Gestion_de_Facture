// Service d'authentification de démo (sans Firebase Auth)
// Utilise localStorage pour simuler l'authentification

const DEMO_USERS = {
  'admin@test.com': {
    password: 'admin123',
    uid: 'demo-admin-uid',
    email: 'admin@test.com',
    role: 'admin',
    nom: 'Administrateur'
  },
  'user@test.com': {
    password: 'user123',
    uid: 'demo-user-uid',
    email: 'user@test.com',
    role: 'user',
    nom: 'Utilisateur'
  }
};

const STORAGE_KEY = 'demo_current_user';

export const loginUser = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = DEMO_USERS[email];
      
      if (!user) {
        reject(new Error('Utilisateur non trouvé'));
        return;
      }
      
      if (user.password !== password) {
        reject(new Error('Mot de passe incorrect'));
        return;
      }
      
      const userSession = {
        uid: user.uid,
        email: user.email,
        role: user.role,
        nom: user.nom
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userSession));
      
      // Notifier tous les listeners
      notifyAuthChange(userSession);
      
      resolve({ user: userSession });
    }, 500);
  });
};

export const logoutUser = () => {
  return new Promise((resolve) => {
    localStorage.removeItem(STORAGE_KEY);
    
    // Notifier tous les listeners
    notifyAuthChange(null);
    
    resolve();
  });
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem(STORAGE_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

// Listeners pour les changements d'authentification
let authListeners = [];

export const onAuthChange = (callback) => {
  // Ajouter le listener
  authListeners.push(callback);
  
  // Appeler immédiatement avec l'utilisateur actuel
  const currentUser = getCurrentUser();
  callback(currentUser);
  
  // Retourner une fonction de nettoyage
  return () => {
    authListeners = authListeners.filter(listener => listener !== callback);
  };
};

// Notifier tous les listeners d'un changement
const notifyAuthChange = (user) => {
  authListeners.forEach(listener => listener(user));
};

export const getUserRole = async (uid) => {
  // D'abord vérifier dans l'utilisateur actuel (mode démo)
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.uid === uid && currentUser.role) {
    return currentUser.role;
  }
  
  // Sinon chercher dans les utilisateurs de démo
  const user = Object.values(DEMO_USERS).find(u => u.uid === uid);
  if (user) {
    return user.role;
  }
  
  // Sinon chercher dans Firebase (si configuré)
  try {
    // Cette partie sera utilisée si Firebase est configuré plus tard
    return null;
  } catch (error) {
    return null;
  }
};

// Initialiser les utilisateurs dans Firebase Realtime Database
export const initDemoUsers = async (database, set, ref) => {
  try {
    for (const [email, userData] of Object.entries(DEMO_USERS)) {
      await set(ref(database, `users/${userData.uid}`), {
        email: userData.email,
        role: userData.role,
        nom: userData.nom,
        createdAt: new Date().toISOString()
      });
    }
    console.log('✓ Utilisateurs de démo initialisés dans Firebase');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des utilisateurs:', error);
  }
};
