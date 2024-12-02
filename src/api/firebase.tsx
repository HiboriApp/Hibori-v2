
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyA7oCGybecfh554ctxG5mGTYNZIDw5PrQg",
    authDomain: "hibori-complete.firebaseapp.com",
    projectId: "hibori-complete",
    storageBucket: "hibori-complete.firebasestorage.app",
    messagingSenderId: "962226487196",
    appId: "1:962226487196:web:77676f622a945c04fb1259",
    measurementId: "G-7T2BCH97TR"
  };
  
  
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);