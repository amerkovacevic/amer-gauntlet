import { useAuth } from '../contexts/AuthContext.jsx';

export function Header() {
  const { user, signIn, signOut, initializing } = useAuth();

  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-blue-500/5 backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-blue-400">Daily Challenge</p>
          <h1 className="text-4xl font-black text-white sm:text-5xl">Amer Gauntlet</h1>
        </div>
        <div className="flex items-center gap-3">
          {initializing ? (
            <span className="text-sm text-slate-300">Loading…</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white">
                {user.displayName || 'Player'}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-blue-400 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-200 transition hover:-translate-y-0.5 hover:border-blue-300"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signIn()}
              className="rounded-full border border-white/40 bg-white/90 px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-900 shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-white"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
      <p className="max-w-3xl text-lg text-slate-200">
        Five bite-sized mental challenges pulled from our vault of twenty mini games. Everyone sees the same gauntlet each day. Race the clock, avoid skips, and build your streak.
      </p>
    </header>
  );
}
