// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'; // Import auth functions

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
const auth = getAuth(app); // Get the auth instance

// Sign in anonymously when the app initializes
signInAnonymously(auth)
  .then(() => {
    console.log("Signed in anonymously");
  })
  .catch((error) => {
    console.error("Error signing in anonymously:", error);
  });

// Listen for auth state changes (optional, but good practice)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in (including anonymous)
    console.log("Auth state changed: User is signed in", user.uid);
  } else {
    // User is signed out
    console.log("Auth state changed: No user signed in");
  }
});


export { db, auth }; // Export auth instance