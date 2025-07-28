// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "mealwhiz-fr88z",
  "appId": "1:151289399985:web:d5aed2e017ff755a98f090",
  "storageBucket": "mealwhiz-fr88z.appspot.com",
  "apiKey": "AIzaSyAyx2KMRBsbYYCmWKtXhjYunWytvzRYImM",
  "authDomain": "mealwhiz-fr88z.firebaseapp.com",
  "messagingSenderId": "151289399985"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
