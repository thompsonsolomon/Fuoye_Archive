// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARnXTO9cDQkdHeqkW-tLKnW709wU6M2ME",
  authDomain: "fuoye-archive.firebaseapp.com",
  projectId: "fuoye-archive",
  storageBucket: "fuoye-archive.firebasestorage.app",
  messagingSenderId: "752245185290",
  appId: "1:752245185290:web:f7affab99f8b4d46a938f3",
  measurementId: "G-DRPH17M591"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const db = getFirestore(app)