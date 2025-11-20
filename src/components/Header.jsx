import { useAuth } from '../contexts/AuthContext.jsx';
import { useMemo } from 'react';

export function Header() {
  const { user, signIn, signOut, initializing } = useAuth();
  
  // Check for debug mode
  const isDebugMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    const urlDebug = urlParams.get('debug') === 'true';
    const storageDebug = window.localStorage.getItem('amer-gauntlet-debug') === 'true';
    return urlDebug || storageDebug;
  }, []);

  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-primary-200 bg-white p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <p className="text-sm uppercase tracking-[0.4em] text-primary-600">Daily Challenge</p>
            {isDebugMode && (
              <span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-warning-100 text-warning-700 border border-warning-300">
                DEBUG MODE
              </span>
            )}
          </div>
          <h1 className="text-4xl font-black text-primary-900 sm:text-5xl">Amer Gauntlet</h1>
        </div>
        <div className="flex items-center gap-3">
          {initializing ? (
            <span className="text-sm text-primary-600">Loading…</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary-900">
                {user.displayName || 'Player'}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-primary-300 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-700 transition hover:-translate-y-0.5 hover:border-primary-400 hover:bg-primary-50"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signIn()}
              className="rounded-full border border-primary-300 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-700 transition hover:-translate-y-0.5 hover:border-primary-400 hover:bg-primary-50"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
      <p className="max-w-3xl text-lg text-primary-700">
        {isDebugMode 
          ? 'All games available for testing. Race the clock, avoid skips, and build your streak.'
          : 'Five bite-sized mental challenges pulled from the vault. Race the clock, avoid skips, and build your streak.'}
      </p>
    </header>
  );
}
