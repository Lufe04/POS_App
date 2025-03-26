import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCOe2Vhl7gYBciFvSI-cqVrYL5WN-__oCY",
  authDomain: "dam-pos.firebaseapp.com",
  projectId: "dam-pos",
  storageBucket: "dam-pos.firebasestorage.app",
  messagingSenderId: "641901122788",
  appId: "1:641901122788:web:c7c2976fba2faad43d88f1",
  measurementId: "G-HTTYZMXVMR"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };