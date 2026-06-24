import { useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  deleteUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import {
  ensureUserProfile,
  subscribeUserProfile,
  deleteUserData,
  updateDisplayName,
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

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      unsubProfile?.();
      unsubProfile = undefined;
      setUser(u);
      // Unblock the app the instant auth is known. We deliberately do NOT await
      // any Firestore work here: gating render on a profile read added a full
      // network round trip to every cold load (and to the lesson critical
      // path). The profile streams in via the subscription below, and
      // ensureUserProfile runs in the background to backfill a missing doc.
      setLoading(false);

      if (u) {
        unsubProfile = subscribeUserProfile(u.uid, setProfile);
        void ensureUserProfile(u);
      } else {
        setProfile(null);
      }
    });

    return () => {
      unsubProfile?.();
      unsubAuth();
    };
  }, []);

  const signUp: AuthState['signUp'] = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const chosenName = displayName?.trim();
    if (chosenName) await updateProfile(cred.user, { displayName: chosenName });
    await ensureUserProfile(cred.user);
    // The auth-state listener may have already created the profile doc with an
    // email-derived name (it fires before updateProfile resolves), so persist
    // the chosen display name explicitly to make sure it wins that race.
    if (chosenName) await updateDisplayName(cred.user.uid, chosenName);
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

  const deleteAccount: AuthState['deleteAccount'] = async () => {
    const current = auth.currentUser;
    if (!current) return;
    // Clear Firestore first while the user is still authenticated — security
    // rules gate those writes on a live session. Only then remove the Auth
    // record itself, which ends the session and triggers the redirect.
    await deleteUserData(current.uid);
    await deleteUser(current);
  };

  const value: AuthState = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
