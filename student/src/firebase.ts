// -----------------------------------------------------------------------------
// Firebase setup for EduHub Student.
//
// Paste the config from Firebase console > Project settings > Your apps > Web.
// The TEACHER CONSOLE must use the SAME project, or live sync will not work.
// -----------------------------------------------------------------------------
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'PASTE_YOUR_API_KEY',
  authDomain: 'PASTE_PROJECT_ID.firebaseapp.com',
  projectId: 'PASTE_PROJECT_ID',
  storageBucket: 'PASTE_PROJECT_ID.appspot.com',
  messagingSenderId: 'PASTE_SENDER_ID',
  appId: 'PASTE_APP_ID',
};

/** True while the placeholder config is still in place: the app runs on in-memory demo data. */
export const isDemoMode = firebaseConfig.apiKey === 'PASTE_YOUR_API_KEY';

export const projectId = firebaseConfig.projectId;

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

if (!isDemoMode) {
  app = initializeApp(firebaseConfig);
  dbInstance = getFirestore(app);
  authInstance = getAuth(app);
}

/** Firestore handle. Only defined in live mode - guard with `isDemoMode` first. */
export const db = dbInstance as Firestore;
/** Firebase Auth handle. Only defined in live mode - guard with `isDemoMode` first. */
export const auth = authInstance as Auth;
