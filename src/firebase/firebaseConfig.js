import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyArVqb1Y1GQVE31zCs-liWLRLtBojU80zA",
  authDomain: "growth-os-fab47.firebaseapp.com",
  projectId: "growth-os-fab47",
  storageBucket: "growth-os-fab47.firebasestorage.app",
  messagingSenderId: "64075661303",
  appId: "1:64075661303:web:3d2ce4eeef4630bbf878f2",
  measurementId: "G-R8BBVZRGRW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;