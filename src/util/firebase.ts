// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Import the Firebase Authentication module
import { getDatabase } from "firebase/database"; // Import Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA-Myc6EMagowUmb9Vjz7X-jw4NWh_OJKQ",
    authDomain: "musephoria.firebaseapp.com",
    databaseURL: "https://musephoria-default-rtdb.firebaseio.com/",  // Realtime Database URL
    projectId: "musephoria",
    storageBucket: "musephoria.appspot.com",
    messagingSenderId: "415992473630",
    appId: "1:415992473630:web:cbbad70b21792fbe98e60f",
    measurementId: "G-QJ7LGYLSZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // Initialize Realtime Database
const auth = getAuth(app);

// Export the db along with other variables
export { app, db, auth };
