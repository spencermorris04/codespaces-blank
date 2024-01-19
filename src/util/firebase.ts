// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";  // Import the Firebase Authentication module

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA-Myc6EMagowUmb9Vjz7X-jw4NWh_OJKQ",
    authDomain: "musephoria.firebaseapp.com",
    projectId: "musephoria",
    storageBucket: "musephoria.appspot.com",
    messagingSenderId: "415992473630",
    appId: "1:415992473630:web:cbbad70b21792fbe98e60f",
    measurementId: "G-QJ7LGYLSZH"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
