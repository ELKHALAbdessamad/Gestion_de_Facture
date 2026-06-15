// ─── Service d'authentification hybride ───────────────────────────────────
// Priorité : Firebase Auth + Realtime Database
// Fallback : comptes démo localStorage (si Firebase indisponible)

const DEMO_USERS = {
  'admin@test.com': { password: 'admin123', uid: 'demo-admin-uid', role: 'admin', nom: 'Administrateur', email: 'admin@test.com' },
  'user@test.com':  { password: 'user123',  uid: 'demo-user-uid',  role: 'user',  nom: 'Utilisateur',    email: 'user@test.com'  },
};
const STORAGE_KEY = 'demo_current_user';
const REGISTERED_KEY = 'demo_registered_users';

let authListeners = [];

const notifyAuthChange = (user) => authListeners.forEach(cb => cb(user));

const loadFirebaseAuth = () => import('./authService');

const getRegisteredUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveRegisteredUser = (email, data) => {
  const registered = getRegisteredUsers();
  registered[email] = data;
  localStorage.setItem(REGISTERED_KEY, JSON.stringify(registered));
};

const loginWithDemoFallback = (email, password) => new Promise((resolve, reject) => {
  const registered = getRegisteredUsers();
  const user = DEMO_USERS[email] || registered[email];

  if (!user) {
    reject(new Error('Utilisateur non trouvé'));
    return;
  }
  if (user.password !== password) {
    reject(new Error('Mot de passe incorrect'));
    return;
  }

  const session = { uid: user.uid, email, role: user.role, nom: user.nom };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  notifyAuthChange(session);
  resolve({ user: session });
});

const mapFirebaseError = (err) => {
  const code = err?.code || '';
  const messages = {
    'auth/email-already-in-use': 'Cet email est déjà utilisé',
    'auth/invalid-email': 'Adresse email invalide',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/invalid-credential': 'Email ou mot de passe incorrect',
    'auth/too-many-requests': 'Trop de tentatives, réessayez plus tard',
  };
  return new Error(messages[code] || err?.message || 'Erreur d\'authentification');
};

export const registerUser = async ({ email, password, nom, entreprise = '', telephone = '' }) => {
  try {
    const { createUser } = await loadFirebaseAuth();
    const userSession = await createUser(email, password, nom, 'user', { entreprise, telephone });
    notifyAuthChange(userSession);
    return { user: userSession };
  } catch (err) {
    if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/configuration-not-found') {
      const registered = getRegisteredUsers();
      if (DEMO_USERS[email] || registered[email]) {
        throw new Error('Cet email est déjà utilisé');
      }
      const uid = `demo-${Date.now()}`;
      saveRegisteredUser(email, {
        password,
        uid,
        role: 'user',
        nom,
        email,
        entreprise,
        telephone,
      });
      const session = { uid, email, role: 'user', nom };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      notifyAuthChange(session);
      return { user: session };
    }
    throw mapFirebaseError(err);
  }
};

export const loginUser = async (email, password) => {
  try {
    const { loginWithFirebase } = await loadFirebaseAuth();
    const userSession = await loginWithFirebase(email, password);
    localStorage.removeItem(STORAGE_KEY);
    notifyAuthChange(userSession);
    return { user: userSession };
  } catch (err) {
    if (['auth/user-not-found', 'auth/invalid-credential', 'auth/wrong-password', 'auth/invalid-login-credentials'].includes(err?.code)) {
      try {
        return await loginWithDemoFallback(email, password);
      } catch {
        throw mapFirebaseError(err);
      }
    }
    if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/configuration-not-found') {
      return loginWithDemoFallback(email, password);
    }
    throw mapFirebaseError(err);
  }
};

export const logoutUser = async () => {
  try {
    const { logoutWithFirebase } = await loadFirebaseAuth();
    await logoutWithFirebase();
  } catch {
    // ignore
  }
  localStorage.removeItem(STORAGE_KEY);
  notifyAuthChange(null);
};

export const getCurrentUser = () => {
  const str = localStorage.getItem(STORAGE_KEY);
  return str ? JSON.parse(str) : null;
};

export const onAuthChange = (callback) => {
  authListeners.push(callback);

  let unsubscribeFirebase = () => {};

  loadFirebaseAuth()
    .then(({ onFirebaseAuthChange, auth }) => {
      unsubscribeFirebase = onFirebaseAuthChange((user) => {
        if (user) {
          localStorage.removeItem(STORAGE_KEY);
        }
        callback(user);
      });

      if (!auth.currentUser) {
        const demo = getCurrentUser();
        if (demo) callback(demo);
      }
    })
    .catch(() => {
      callback(getCurrentUser());
    });

  return () => {
    unsubscribeFirebase();
    authListeners = authListeners.filter(l => l !== callback);
  };
};

export const getUserRole = async (uid) => {
  try {
    const { auth } = await loadFirebaseAuth();
    if (auth.currentUser?.uid === uid) {
      const { getDatabase, ref, get } = await import('firebase/database');
      const { getApps } = await import('firebase/app');
      const db = getDatabase(getApps()[0]);
      const snap = await get(ref(db, `users/${uid}`));
      if (snap.exists()) return snap.val().role || 'user';
    }
  } catch {
    // fallback below
  }

  const current = getCurrentUser();
  if (current?.uid === uid) return current.role;

  const registered = Object.values(getRegisteredUsers());
  const reg = registered.find(u => u.uid === uid);
  if (reg) return reg.role;

  const demo = Object.values(DEMO_USERS).find(u => u.uid === uid);
  return demo?.role || 'user';
};

export const initDemoUsers = async (database, set, refFn) => {
  try {
    for (const [, u] of Object.entries(DEMO_USERS)) {
      await set(refFn(database, `users/${u.uid}`), {
        email: u.email,
        role: u.role,
        nom: u.nom,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.warn('initDemoUsers:', e.message);
  }
};
