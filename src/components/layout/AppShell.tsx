import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';

export function AppShell() {
  return (
    <div className="min-h-screen bg-canvas">
      <TopNav />
      {/* pb leaves room for the mobile bottom tab bar */}
      <main className="mx-auto max-w-5xl px-4 pt-6 pb-24 md:pb-12">
        <Outlet />
      </main>
    </div>
  );
}
