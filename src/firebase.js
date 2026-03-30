
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyCzE0DqRUFXzbqDMxOgvsFZqk1wOCpW9ig",
  authDomain: "gestion-des-factures-52d03.firebaseapp.com",
  databaseURL: "https://gestion-des-factures-52d03-default-rtdb.firebaseio.com",
  projectId: "gestion-des-factures-52d03",
  storageBucket: "gestion-des-factures-52d03.firebasestorage.app",
  messagingSenderId: "362567183024",
  appId: "1:362567183024:web:d05e9af88f0dc05cd0a975",
  measurementId: "G-RDK8KRTL6H"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);