import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCipsZKwwK99pl23zoVgjRi9wu3B6COMaA",
  authDomain: "ev-hesab-bolgusu.firebaseapp.com",
  projectId: "ev-hesab-bolgusu",
  storageBucket: "ev-hesab-bolgusu.firebasestorage.app",
  messagingSenderId: "723922066450",
  appId: "1:723922066450:web:bbb0c4befb0992f9980ccb",
  measurementId: "G-ZV6P3FQNMT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);