import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { getDatabase, ref, get, set } from 'firebase/database';
import { firebaseConfig } from '../config/firebase';

const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getDatabase(app);

const fetchUserProfile = async (uid) => {
  const userSnap = await get(ref(db, `users/${uid}`));
  if (!userSnap.exists()) return { role: 'user', nom: '', entreprise: '', telephone: '' };
  const data = userSnap.val();
  return {
    role: data.role || 'user',
    nom: data.nom || '',
    entreprise: data.entreprise || '',
    telephone: data.telephone || '',
  };
};

export const loginWithFirebase = async (email, password) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user       = credential.user;
  const profile    = await fetchUserProfile(user.uid);

  return {
    uid  : user.uid,
    email: user.email,
    nom  : user.displayName || profile.nom || email.split('@')[0],
    role : profile.role,
  };
};

export const logoutWithFirebase = () => signOut(auth);

export const onFirebaseAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }
    try {
      const profile = await fetchUserProfile(user.uid);
      callback({
        uid: user.uid,
        email: user.email,
        nom: user.displayName || profile.nom,
        role: profile.role,
      });
    } catch {
      callback({ uid: user.uid, email: user.email, role: 'user' });
    }
  });
};

export const createUser = async (email, password, nom, role = 'user', extra = {}) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user       = credential.user;

  await updateProfile(user, { displayName: nom });

  await set(ref(db, `users/${user.uid}`), {
    email,
    nom,
    role,
    entreprise: extra.entreprise || '',
    telephone: extra.telephone || '',
    createdAt: new Date().toISOString(),
  });

  return {
    uid: user.uid,
    email: user.email,
    nom,
    role,
  };
};

export const getJWT = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

export { auth };
