import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);

// Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Auth helpers
export const authHelpers = {
  // Social login
  loginWithGoogle: () => signInWithPopup(auth, googleProvider),
  loginWithGithub: () => signInWithPopup(auth, githubProvider),

  // Email/Password
  loginWithEmail: (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password),
  
  registerWithEmail: (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password),

  // Logout
  logout: () => signOut(auth),

  // Get ID Token for backend
  getIdToken: async (user: User): Promise<string> => {
    return await user.getIdToken();
  },
};

export type { User };