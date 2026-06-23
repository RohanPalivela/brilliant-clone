import { Loader2 } from 'lucide-react';

export function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted">
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
