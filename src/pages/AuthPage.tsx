import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingScreen } from '../components/ui/LoadingScreen';

type Mode = 'signin' | 'signup';

function friendlyError(code: string): string {
  if (code.includes('invalid-credential') || code.includes('wrong-password'))
    return 'That email and password don’t match. Try again.';
  if (code.includes('email-already-in-use'))
    return 'An account already exists with that email. Try signing in.';
  if (code.includes('weak-password'))
    return 'Password should be at least 6 characters.';
  if (code.includes('invalid-email')) return 'That doesn’t look like a valid email.';
  if (code.includes('popup-closed')) return 'Google sign-in was cancelled.';
  return 'Something went wrong. Please try again.';
}

export function AuthPage() {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <LoadingScreen />;
  if (user) {
    const dest =
      (location.state as { from?: { pathname: string } } | null)?.from?.pathname ??
      '/';
    return <Navigate to={dest} replace />;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signup') await signUp(email, password, name.trim());
      else await signIn(email, password);
    } catch (err) {
      setError(friendlyError((err as { code?: string }).code ?? ''));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(friendlyError((err as { code?: string }).code ?? ''));
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'h-12 w-full rounded-xl border border-line bg-white px-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-cta text-white">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-bold text-ink">Learn by doing</h1>
          <p className="mt-1 text-sm text-muted">
            {mode === 'signin'
              ? 'Welcome back. Pick up where you left off.'
              : 'Create an account to start learning.'}
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === 'signup' && (
              <input
                className={inputClass}
                type="text"
                placeholder="Display name"
                aria-label="Display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              className={inputClass}
              type="email"
              placeholder="Email"
              aria-label="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className={inputClass}
              type="password"
              placeholder="Password"
              aria-label="Password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="rounded-lg bg-wrong-soft px-3 py-2 text-sm text-wrong">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={busy} className="mt-1 w-full">
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <Button
            variant="secondary"
            size="lg"
            onClick={google}
            disabled={busy}
            className="w-full"
          >
            <GoogleGlyph />
            Continue with Google
          </Button>
        </Card>

        <p className="mt-6 text-center text-sm text-muted">
          {mode === 'signin' ? 'New here?' : 'Already have an account?'}{' '}
          <button
            type="button"
            className="font-semibold text-brand hover:underline"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
          >
            {mode === 'signin' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
