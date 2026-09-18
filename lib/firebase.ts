// Firebase initialization for the Community feature.
//
// Uses Firestore for shared data (visible to every visitor) and Anonymous
// Auth just to give each browser a stable identity for posting/upvoting —
// there is NO login screen and nothing user-facing changes; sign-in happens
// silently in the background the first time someone posts or upvotes. This
// is deliberate: Ansh decided against a full login flow for ASPIRE, but a
// community board that everyone can read and write to needs *some* way to
// tell one poster's upvote from another's without asking anyone to sign up.
//
// SETUP NEEDED (Ansh):
// 1. Firebase Console → create/open a project → Build → Firestore Database
//    → Create database (start in production mode, pick a region close to
//    India e.g. asia-south1).
// 2. Build → Authentication → Sign-in method → enable "Anonymous".
// 3. Project Settings → General → "Your apps" → Web app → copy the config.
// 4. Add to .env.local AND Vercel env vars:
//      NEXT_PUBLIC_FIREBASE_API_KEY=
//      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
//      NEXT_PUBLIC_FIREBASE_PROJECT_ID=
//      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
//      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
//      NEXT_PUBLIC_FIREBASE_APP_ID=
// 5. Deploy the rules in firestore.rules (Firebase Console → Firestore →
//    Rules tab → paste → Publish), so writes stay validated server-side.
// 6. npm install firebase

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
