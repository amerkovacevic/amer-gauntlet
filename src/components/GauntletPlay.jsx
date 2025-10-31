import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useGauntlet } from '../contexts/GauntletContext.jsx';
import { db } from '../lib/firebase.js';
import { calculateScore, formatDuration } from '../utils/scoring.js';
import { getWeekId, getYesterdayId } from '../utils/date.js';

function StatusBadge({ status }) {
  const mapping = {
    locked: 'border-slate-800 text-slate-400',
    active: 'border-blue-400 text-blue-200',
    passed: 'border-blue-500 bg-blue-500/10 text-blue-200',
    failed: 'border-rose-500 bg-rose-500/10 text-rose-200',
    skipped: 'border-amber-500 bg-amber-500/10 text-amber-200',
  };
  const label = {
    locked: 'Ready',
    active: 'In progress',
    passed: 'Cleared',
    failed: 'Failed',
    skipped: 'Skipped',
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest ${mapping[status]}`}>
      {label[status]}
    </span>
  );
}

function LeaderboardList({ entries }) {
  if (!entries.length) {
    return <p className="text-sm text-slate-400">No runs recorded yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-200"
        >
          <span className="font-semibold text-white">{entry.displayName}</span>
          <span className="font-mono text-blue-300">{entry.score.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}

export function GauntletPlay() {
  const { user, signIn, initializing } = useAuth();
  const gauntlet = useGauntlet();
  const { todayId, selection, state, totals, isComplete } = gauntlet;
  const { passes, skips, fails, totalTime } = totals;
  const score = calculateScore({
    completed: passes,
    skips,
    fails,
    totalTime,
  });
  const [syncStatus, setSyncStatus] = useState('idle');
  const [leaderboard, setLeaderboard] = useState({
    daily: [],
    weekly: [],
    allTime: [],
  });

  useEffect(() => {
    setSyncStatus('idle');
  }, [todayId]);

  const currentGame = gauntlet.currentGame;
  const ActiveGameComponent = currentGame?.Component ?? null;

  const summary = useMemo(() => ({
    score,
    passes,
    skips,
    fails,
    totalTime: Math.round(totalTime),
  }), [score, passes, skips, fails, totalTime]);

  useEffect(() => {
    if (!isComplete || !user || syncStatus === 'synced') return;
    let cancelled = false;
    async function syncResult() {
      try {
        setSyncStatus('saving');
        const runId = doc(collection(db, 'runs')).id;
        const payload = {
          uid: user.uid,
          displayName: user.displayName || 'Player',
          score: summary.score,
          passes: summary.passes,
          skips: summary.skips,
          fails: summary.fails,
          totalTime: summary.totalTime,
          date: todayId,
          weekId: getWeekId(todayId),
          completedAt: serverTimestamp(),
        };

        const dailyRef = doc(db, 'dailyGauntlets', todayId, 'results', user.uid);
        const existingDaily = await getDoc(dailyRef);
        if (!existingDaily.exists() || existingDaily.data().score < summary.score) {
          await setDoc(dailyRef, payload, { merge: true });
        }

        const runsRef = doc(db, 'runs', runId);
        await setDoc(runsRef, payload);

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const yesterday = getYesterdayId(todayId);
        let streak = 1;
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.lastCompleted === todayId) {
            streak = data.streak || 1;
          } else if (data.lastCompleted === yesterday) {
            streak = (data.streak || 0) + 1;
          } else {
            streak = 1;
          }
        }
        await setDoc(
          userRef,
          {
            displayName: user.displayName || 'Player',
            streak,
            lastCompleted: todayId,
            bestScore: Math.max(summary.score, userSnap?.data()?.bestScore || 0),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        if (!cancelled) {
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error('Failed to sync result', error);
        if (!cancelled) setSyncStatus('error');
      }
    }

    syncResult();
    return () => {
      cancelled = true;
    };
  }, [isComplete, user, summary, todayId, syncStatus]);

  useEffect(() => {
    async function fetchLeaderboard() {
      const dailyQuery = query(
        collection(db, 'dailyGauntlets', todayId, 'results'),
        orderBy('score', 'desc'),
        limit(10),
      );
      const weekId = getWeekId(todayId);
      const weeklyQuery = query(
        collection(db, 'runs'),
        where('weekId', '==', weekId),
        orderBy('score', 'desc'),
        limit(10),
      );
      const allTimeQuery = query(collection(db, 'runs'), orderBy('score', 'desc'), limit(10));
      const [dailySnap, weeklySnap, allTimeSnap] = await Promise.all([
        getDocs(dailyQuery),
        getDocs(weeklyQuery),
        getDocs(allTimeQuery),
      ]);
      setLeaderboard({
        daily: dailySnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
        weekly: weeklySnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
        allTime: allTimeSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
      });
    }

    fetchLeaderboard().catch((error) => console.error('Failed to load leaderboards', error));
  }, [todayId, syncStatus]);

  const canPlay = Boolean(user);
  const handlePass = () => {
    if (!canPlay) return;
    gauntlet.recordPass(state.currentIndex);
  };
  const handleFail = () => {
    if (!canPlay) return;
    gauntlet.recordFail(state.currentIndex);
  };
  const handleSkip = () => {
    if (!canPlay) return;
    gauntlet.recordSkip(state.currentIndex);
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-500/5 backdrop-blur">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold text-white">Today&apos;s Gauntlet</h2>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-400">{todayId}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-6 shadow-inner shadow-black/40">
            {initializing ? (
              <div className="space-y-3 text-center text-sm text-slate-300">
                <p>Loading your profile…</p>
              </div>
            ) : !canPlay ? (
              <div className="space-y-4 text-center">
                <h3 className="text-3xl font-semibold text-white">Sign in to play</h3>
                <p className="text-sm text-slate-300">
                  You need to be signed in to attempt today&apos;s Amer Gauntlet and post a score to the leaderboards.
                </p>
                <button
                  type="button"
                  onClick={() => signIn()}
                  className="rounded-full bg-blue-500 px-6 py-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-950 shadow-lg shadow-blue-500/40 transition hover:-translate-y-0.5 hover:bg-blue-400"
                >
                  Sign in with Google
                </button>
              </div>
            ) : currentGame && ActiveGameComponent && !isComplete ? (
              <ActiveGameComponent
                key={currentGame.id}
                challenge={currentGame.challenge}
                onPass={handlePass}
                onFail={handleFail}
                onSkip={handleSkip}
              />
            ) : (
              <div className="space-y-4 text-center">
                <h3 className="text-3xl font-semibold text-white">Gauntlet complete</h3>
                <p className="text-sm text-slate-300">
                  {user
                    ? 'Your score has been locked in. Come back tomorrow for the next Amer Gauntlet.'
                    : 'Sign in to save your streak and post on the leaderboards.'}
                </p>
                <div className="grid grid-cols-2 gap-3 text-left text-sm">
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Score</p>
                    <p className="text-2xl font-bold text-white">{summary.score.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Time</p>
                    <p className="text-2xl font-bold text-white">{formatDuration(summary.totalTime)}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Passes</p>
                    <p className="text-2xl font-bold text-white">{summary.passes}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Skips / Fails</p>
                    <p className="text-2xl font-bold text-white">{summary.skips} / {summary.fails}</p>
                  </div>
                </div>
                {syncStatus === 'saving' ? (
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Posting to leaderboards…</p>
                ) : syncStatus === 'error' ? (
                  <p className="text-xs uppercase tracking-[0.3em] text-rose-400">Failed to sync score. Try refreshing.</p>
                ) : null}
              </div>
            )}
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {selection.map((game, index) => {
              const status = state.statuses[index]?.status ?? 'locked';
              return (
                <li
                  key={game.id}
                  className={`flex flex-col gap-2 rounded-2xl border px-4 py-4 shadow-lg transition ${
                    status === 'passed'
                      ? 'border-blue-500/60 bg-blue-500/10 shadow-blue-500/10'
                      : status === 'failed'
                        ? 'border-rose-500/60 bg-rose-500/10 shadow-rose-500/10'
                        : status === 'skipped'
                          ? 'border-amber-500/60 bg-amber-500/10 shadow-amber-500/10'
                          : status === 'active'
                            ? 'border-blue-400/60 bg-slate-900/60 shadow-blue-500/20'
                            : 'border-slate-800/60 bg-slate-900/40 shadow-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{game.name}</p>
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-xs text-slate-300">Challenge #{index + 1}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <aside className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-500/5 backdrop-blur">
          <h3 className="text-xl font-semibold text-white">Leaderboard</h3>
          <div className="mt-4 space-y-6">
            <div>
              <h4 className="text-xs uppercase tracking-[0.3em] text-blue-400">Daily</h4>
              <LeaderboardList entries={leaderboard.daily} />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.3em] text-blue-400">This Week</h4>
              <LeaderboardList entries={leaderboard.weekly} />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.3em] text-blue-400">All Time</h4>
              <LeaderboardList entries={leaderboard.allTime} />
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
