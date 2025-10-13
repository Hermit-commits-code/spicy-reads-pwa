// Firebase configuration and initialization
// Replace the below config with your Firebase project credentials
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBiWcmYtqfRkahVEjo2sq6IxB7Zn36mWJk",
  authDomain: "velvet-volumes.firebaseapp.com",
  projectId: "velvet-volumes",
  storageBucket: "velvet-volumes.firebasestorage.app",
  messagingSenderId: "1043502245411",
  appId: "1:1043502245411:web:8efdeaefb3a32342c5b396"
};

const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
