import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { 
  FIREBASE_API_KEY, 
  FIREBASE_AUTH_DOMAIN, 
  FIREBASE_PROJECT_ID, 
  FIREBASE_STORAGE_BUCKET, 
  FIREBASE_MESSAGING_SENDER_ID, 
  FIREBASE_APP_ID 
} from "@env";

// Validate environment variables
const requiredEnvVars = {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID
};

for (const [varName, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.error(`Missing required Firebase environment variable: ${varName}`);
    throw new Error(`Missing Firebase config: ${varName}`);
  }
}

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

let app;
let auth;
let db;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Enable Firestore persistence
  await enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn("Multiple tabs open, persistence can only be enabled in one tab");
      } else if (err.code === 'unimplemented') {
        console.warn("The current environment does not support all features required for persistence");
      }
    });
    
  analytics = getAnalytics(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

// Verify Firestore is properly initialized
if (!db) {
  throw new Error("Firestore failed to initialize");
}

export { auth, db, analytics };
