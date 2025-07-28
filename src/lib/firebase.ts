// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "mealwhiz-fr88z",
  "appId": "1:151289399985:web:d5aed2e017ff755a98f090",
  "storageBucket": "mealwhiz-fr88z.appspot.com",
  "apiKey": "AIzaSyAyx2KMRBsbYYCmWKtXhjYunWytvzRYImM",
  "authDomain": "mealwhiz-fr88z.firebaseapp.com",
  "messagingSenderId": "151289399985"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, signInAnonymously, onAuthStateChanged };
export type { User };
