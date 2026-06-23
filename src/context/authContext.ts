import { createContext } from 'react';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../types/progress';

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  /** Permanently delete the user's Firestore data and Firebase Auth account. */
  deleteAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);
