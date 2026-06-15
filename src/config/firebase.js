export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyCzE0DqRUFXzbqDMxOgvsFZqk1wOCpW9ig',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'gestion-des-factures-52d03.firebaseapp.com',
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || 'https://gestion-des-factures-52d03-default-rtdb.firebaseio.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'gestion-des-factures-52d03',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'gestion-des-factures-52d03.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '362567183024',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:362567183024:web:d05e9af88f0dc05cd0a975',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-RDK8KRTL6H',
};
