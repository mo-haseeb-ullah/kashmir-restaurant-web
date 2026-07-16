import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIfeo06n7e3zjRY1xfxYP7_wGuO1NdS9s",
  authDomain: "kashmir-restaurant-2ab78.firebaseapp.com",
  projectId: "kashmir-restaurant-2ab78",
  storageBucket: "kashmir-restaurant-2ab78.firebasestorage.app",
  messagingSenderId: "602581021128",
  appId: "1:602581021128:web:dbc068290b0fe13aef90fd",
  measurementId: "G-2BWSMHDPNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
