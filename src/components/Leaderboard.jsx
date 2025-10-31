import { useEffect, useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext.jsx';
import { fetchLeaderboard } from '../utils/leaderboard.js';

const TITLES = {
  daily: 'Daily Leaders',
  monthly: 'Monthly Leaders',
  allTime: 'All-Time Legends',
};

export function Leaderboard({ type, bucket, limit = 10 }) {
  const { db } = useFirebase();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchLeaderboard(db, type, bucket, limit);
        if (mounted) {
          setEntries(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [db, type, bucket, limit]);

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{TITLES[type] ?? 'Leaderboard'}</h3>
        {bucket && <span className="text-xs uppercase tracking-widest text-slate-400">{bucket}</span>}
      </header>
      {loading && <p className="text-sm text-slate-400">Loading leaderboard…</p>}
      {error && (
        <p className="text-sm text-red-400">
          Unable to load leaderboard. Check your Firebase security rules and network connection.
        </p>
      )}
      {!loading && !error && entries.length === 0 && (
        <p className="text-sm text-slate-500">No scores yet. Be the first to set the bar!</p>
      )}
      <ol className="space-y-2">
        {entries.map((entry, index) => (
          <li
            key={entry.id}
            className="flex items-center justify-between bg-slate-950/40 border border-slate-800/70 rounded-xl px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">
                {index + 1}. {entry.displayName ?? 'Anonymous'}
              </p>
              <p className="text-xs text-slate-400">
                {entry.total} pts • {entry.correct} correct • {entry.skipped} skipped
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {entry.secondsElapsed ? `${entry.secondsElapsed}s` : '—'}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
