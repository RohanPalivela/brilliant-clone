import { useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import {
  ensureUserProfile,
  subscribeUserProfile,
} from '../data/progressService';
import type { UserProfile } from '../types/progress';
import type { User } from 'firebase/auth';
import { AuthContext, type AuthState } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      unsubProfile?.();
      unsubProfile = undefined;
      setUser(u);

      if (u) {
        await ensureUserProfile(u);
        unsubProfile = subscribeUserProfile(u.uid, setProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubProfile?.();
      unsubAuth();
    };
  }, []);

  const signUp: AuthState['signUp'] = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });
    await ensureUserProfile(cred.user);
  };

  const signIn: AuthState['signIn'] = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle: AuthState['signInWithGoogle'] = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout: AuthState['logout'] = async () => {
    await signOut(auth);
  };

  const value: AuthState = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
