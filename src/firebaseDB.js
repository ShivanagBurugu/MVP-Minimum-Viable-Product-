// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database"; // Import Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7_5adrknxKSbwQecDrxi-6jECoV0GrEs",
  authDomain: "mvp-project-a4fa1.firebaseapp.com",
  projectId: "mvp-project-a4fa1",
  storageBucket: "mvp-project-a4fa1.appspot.com",
  messagingSenderId: "478497407743",
  appId: "1:478497407743:web:904304b17f7c62c7c502ca",
  databaseURL: "https://mvp-project-a4fa1-default-rtdb.firebaseio.com/", // Add your Realtime Database URL here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const realtimeDb = getDatabase(app); // Initialize Realtime Database

export { auth, db, storage, realtimeDb }; // Export Realtime Database
