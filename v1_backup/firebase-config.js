// Firebase Configuration for Bajrangi Nutrition Kurukshetra
// Automatically generated and configured.

const firebaseConfig = {
  apiKey: "AIzaSyBu6_3Nomh7i2fQLM9J3BYijOeRParMu4g",
  authDomain: "bajrangi-nutrition.firebaseapp.com",
  projectId: "bajrangi-nutrition",
  storageBucket: "bajrangi-nutrition.firebasestorage.app",
  messagingSenderId: "429034647134",
  appId: "1:429034647134:web:8a694941fc862bf2068ecf",
  measurementId: "G-0FVM4GCSNQ"
};

// Check if Firebase is actually configured by the user
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" &&
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== "YOUR_FIREBASE_PROJECT_ID";

// Export configuration and status
window.firebaseConfig = firebaseConfig;
window.isFirebaseConfigured = isFirebaseConfigured;

console.log(
  isFirebaseConfigured 
    ? "🔥 Firebase Configuration Detected. Connecting to cloud database..." 
    : "ℹ️ Firebase placeholder keys detected. Operating in high-fidelity LocalStorage offline mode."
);
