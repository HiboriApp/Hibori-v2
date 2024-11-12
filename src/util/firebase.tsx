
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export function InitFirebase(){
    const firebaseConfig = {
        apiKey: "AIzaSyA7oCGybecfh554ctxG5mGTYNZIDw5PrQg",
        authDomain: "hibori-complete.firebaseapp.com",
        projectId: "hibori-complete",
        storageBucket: "hibori-complete.firebasestorage.app",
        messagingSenderId: "962226487196",
        appId: "1:962226487196:web:77676f622a945c04fb1259",
        measurementId: "G-7T2BCH97TR"
      };
      
      
      const app = initializeApp(firebaseConfig);
      const analytics = getAnalytics(app);
      return {app, analytics};
}

