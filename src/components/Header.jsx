export function Header() {
  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-tertiary-500/30 bg-secondary-700/70 p-8 shadow-2xl shadow-tertiary-500/20">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-tertiary-400">Daily Challenge</p>
          <h1 className="text-4xl font-black text-accent-50 sm:text-5xl">Amer Gauntlet</h1>
        </div>
        {/* <div className="flex items-center gap-3">
          {initializing ? (
            <span className="text-sm text-quaternary-300">Loading…</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-accent-50">
                {user.displayName || 'Player'}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-tertiary-400 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-tertiary-300 transition hover:-translate-y-0.5 hover:border-tertiary-300"
              >
                Sign out
              </button>
            </div>
          ) : (
            <span className="text-sm text-quaternary-300">Sign in below to enter the gauntlet.</span>
          )}
        </div> */}
      </div>
      <p className="max-w-3xl text-lg text-quaternary-200">
        Five bite-sized mental challenges pulled from the vault. Race the clock, avoid skips, and build your streak.
      </p>
    </header>
  );
}
