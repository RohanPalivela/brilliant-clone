import { auth } from '../firebase';

/**
 * Mint a Firebase ID token for the signed-in learner, or return null when nobody
 * is signed in. The `/api/tutor` proxy verifies this token before spending API
 * credits, which is what lets the real model key stay on the server. Isolated in
 * its own module so the network client stays testable without booting Firebase.
 */
export async function getTutorAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
