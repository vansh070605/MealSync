import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Replace the placeholder values with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDW-fDV2wXKUJFH3m-iri7nQwAtyqagQ3Q",
  authDomain: "mealsync-7ddce.firebaseapp.com",
  databaseURL: "https://mealsync-7ddce-default-rtdb.firebaseio.com",
  projectId: "mealsync-7ddce",
  storageBucket: "mealsync-7ddce.firebasestorage.app",
  messagingSenderId: "1045059329723",
  appId: "1:1045059329723:web:93aa8a9351ea6f9cabd39e",
  measurementId: "G-6CP48B2C1Z"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
