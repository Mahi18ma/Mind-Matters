// ─────────────────────────────────────────────────────────────────────────────
// Firebase — Mind Over Matter (tinkerhack-4)
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Firebase is configured when the API key exists and isn't a placeholder
export const FIREBASE_CONFIGURED = !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_API_KEY !== 'paste-your-apiKey-here'
);

// Only initialise Firebase when credentials are actually present.
// Without this guard, initializeApp() throws with undefined values, which
// crashes the entire app at module load time → white screen on Vercel.
let app = null;
export let auth = null;
export let db = null;

if (FIREBASE_CONFIGURED) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        // Analytics — only loads in browsers that support it
        isSupported().then(yes => { if (yes) getAnalytics(app); });
    } catch (err) {
        console.warn('Firebase failed to initialise — running in offline mode.', err);
    }
}
