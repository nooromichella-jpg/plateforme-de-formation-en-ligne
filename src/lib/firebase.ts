/**
 * Configuration et initialisation du SDK Firebase pour SkillHub.
 * Initialisé avec le projet Firebase réel provisionné (Auth Google + Firestore).
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore, setLogLevel } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: firebaseConfigJson.authDomain || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseConfigJson.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: firebaseConfigJson.storageBucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseConfigJson.messagingSenderId || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseConfigJson.appId || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: firebaseConfigJson.measurementId || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Configuration sécurisée du niveau de log Firestore en 'silent'
// Cela évite que les notifications transitoires de bascule hors-ligne ne polluent la console d'erreur
try {
  setLogLevel('silent');
} catch {
  // Ignorer si non supporté
}

// Neutralisation défensive des assertions internes connues du SDK Firebase Auth (@firebase/auth race conditions)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const msg = event?.message || (event?.error?.message ?? '');
    if (typeof msg === 'string' && (msg.includes('Pending promise was never set') || msg.includes('INTERNAL ASSERTION FAILED'))) {
      event.preventDefault();
      event.stopImmediatePropagation();
      console.warn('[Firebase Auth] Assertion interne non bloquante interceptée:', msg);
      return true;
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = typeof reason === 'string' ? reason : (reason?.message || '');
    if (typeof msg === 'string' && (msg.includes('Pending promise was never set') || msg.includes('INTERNAL ASSERTION FAILED'))) {
      event.preventDefault();
      event.stopImmediatePropagation();
      console.warn('[Firebase Auth] Rejet interne non bloquant intercepté:', msg);
    }
  });
}

// Mémorisation globale pour éviter les réinitialisations intempestives lors du rechargement de module
const globalForFirebase = globalThis as unknown as {
  _firebaseApp?: FirebaseApp;
  _firebaseAuth?: Auth;
  _firestoreDb?: Firestore;
};

// Initialisation sécurisée en Singleton
const app: FirebaseApp = 
  globalForFirebase._firebaseApp || 
  (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig));
globalForFirebase._firebaseApp = app;

// Services Firebase exportés
const auth: Auth = globalForFirebase._firebaseAuth || getAuth(app);
globalForFirebase._firebaseAuth = auth;

let db: Firestore = globalForFirebase._firestoreDb!;
if (!db) {
  try {
    // Correction : Suppression de experimentalForceLongPolling pour débloquer les requêtes Firestore
    db = initializeFirestore(
      app,
      {
        ignoreUndefinedProperties: true,
      },
      firebaseConfigJson.firestoreDatabaseId || '(default)'
    );
  } catch {
    db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || '(default)');
  }
  globalForFirebase._firestoreDb = db;
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('email');
googleProvider.addScope('profile');

export { app, auth, db, googleProvider };
export default app;