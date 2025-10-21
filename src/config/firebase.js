import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with platform-specific persistence
let auth;
if (Platform.OS === "web") {
  // Web: Use browser persistence
  const {
    getAuth,
    browserLocalPersistence,
    setPersistence,
  } = require("firebase/auth");
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn("Failed to set browser persistence:", error);
  });
} else {
  // Mobile: Use React Native persistence with AsyncStorage
  const AsyncStorage =
    require("@react-native-async-storage/async-storage").default;
  const {
    getReactNativePersistence,
    initializeAuth,
  } = require("firebase/auth");
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };

// Initialize Firestore with offline persistence settings
export const db = initializeFirestore(app, {
  cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
  experimentalForceLongPolling: false, // Set to true if having connection issues
});

export const realtimeDb = getDatabase(app);
export const storage = getStorage(app);

// Log Firebase initialization (useful for debugging)
console.log("✅ Firebase initialized successfully");
console.log("📦 Project ID:", firebaseConfig.projectId);

export default app;
