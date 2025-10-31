import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useGauntlet } from '../contexts/GauntletContext.jsx';
import { db } from '../lib/firebase.js';
import { calculateScoreBreakdown, formatDuration } from '../utils/scoring.js';
import { getWeekId, getYesterdayId } from '../utils/date.js';

function formatDisplayDate(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${month} ${day} ${year}`;
}

function LeaderboardList({ entries, showDate = false }) {
  if (!entries.length) {
    return (
      <p className="mt-2 rounded-xl border border-white/5 bg-slate-950/40 px-4 py-3 text-sm text-slate-400">
        No runs recorded yet.
      </p>
    );
  }

  return (
    <ul className="mt-2 space-y-2">
      {entries.map((entry, index) => (
        <li
          key={entry.id}
          className={`grid items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 backdrop-blur ${
            showDate ? 'grid-cols-[auto_1fr_auto_auto]' : 'grid-cols-[auto_1fr_auto]'
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
            {(index + 1).toString().padStart(2, '0')}
          </span>
          <span className="truncate font-semibold text-white">{entry.displayName}</span>
          {showDate ? (
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
              {formatDisplayDate(entry.date)}
            </span>
          ) : null}
          <span className="font-mono text-blue-200">{entry.score.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}

function ScoreBreakdownDetails({ summary }) {
  if (!summary?.breakdown) return null;

  const { breakdown } = summary;
  const formatContribution = (value, isPenalty = false) => {
    if (!value) return '0';
    const formatted = Math.abs(value).toLocaleString();
    return `${isPenalty ? '−' : '+'}${formatted}`;
  };

  const accuracyCount = Math.max(0, (summary?.passes ?? 0) - (summary?.fails ?? 0));
  const totalTime = summary?.totalTime ?? 0;

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4 text-left text-sm text-slate-200">
      <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">Score breakdown</h4>
      <ul className="mt-4 space-y-3">
        <li className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-white">Completion bonus</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {summary.passes} clears × 200
            </p>
          </div>
          <span className="font-mono text-blue-200">{formatContribution(breakdown.completionBonus)}</span>
        </li>
        <li className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-white">Accuracy bonus</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              max({summary.passes} − {summary.fails}, 0) × 50 → {accuracyCount}
            </p>
          </div>
          <span className="font-mono text-blue-200">{formatContribution(breakdown.accuracyBonus)}</span>
        </li>
        <li className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-white">Skip penalty</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {summary.skips} skips × 75
            </p>
          </div>
          <span className="font-mono text-rose-300">{formatContribution(breakdown.skipPenalty, true)}</span>
        </li>
        <li className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-white">Fail penalty</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {summary.fails} fails × 125
            </p>
          </div>
          <span className="font-mono text-rose-300">{formatContribution(breakdown.failPenalty, true)}</span>
        </li>
        <li className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-white">Time penalty</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              ⌊{totalTime} × 0.5⌋
            </p>
          </div>
          <span className="font-mono text-rose-300">{formatContribution(breakdown.timePenalty, true)}</span>
        </li>
      </ul>
      <div className="mt-4 flex items-baseline justify-between border-t border-white/5 pt-3">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Final score</span>
        <span className="font-mono text-lg text-blue-200">{summary.score.toLocaleString()}</span>
      </div>
    </div>
  );
}

export function GauntletPlay() {
  const { user, signIn, initializing } = useAuth();
  const gauntlet = useGauntlet();
  const { todayId, selection, state, totals, isComplete } = gauntlet;
  const { passes, skips, fails, totalTime } = totals;
  const [syncStatus, setSyncStatus] = useState('idle');
  const [leaderboard, setLeaderboard] = useState({
    daily: [],
    allTime: [],
  });
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [existingResult, setExistingResult] = useState(null);
  const [checkingExistingRun, setCheckingExistingRun] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    setSyncStatus('idle');
  }, [todayId]);

  const currentGame = gauntlet.currentGame;
  const ActiveGameComponent = currentGame?.Component ?? null;

  const summary = useMemo(() => {
    const normalizedTotalTime = Math.round(totalTime);
    const breakdown = calculateScoreBreakdown({
      completed: passes,
      skips,
      fails,
      totalTime: normalizedTotalTime,
    });
    return {
      score: breakdown.total,
      passes,
      skips,
      fails,
      totalTime: normalizedTotalTime,
      breakdown,
    };
  }, [passes, skips, fails, totalTime]);

  const formattedToday = useMemo(() => {
    const [year, month, day] = todayId.split('-');
    return `${month} ${day} ${year}`;
  }, [todayId]);

  const { completedCount, progressPercentage, nextChallengeNumber } = useMemo(() => {
    const finishedStatuses = new Set(['passed', 'failed', 'skipped']);
    const completed = state.statuses.filter((item) => finishedStatuses.has(item.status)).length;
    const totalChallenges = selection.length || 1;
    const percentage = Math.round((completed / totalChallenges) * 100);
    const nextChallenge = Math.min(completed + 1, selection.length);
    return {
      completedCount: completed,
      progressPercentage: percentage,
      nextChallengeNumber: nextChallenge,
    };
  }, [selection.length, state.statuses]);

  const displayedSummary = useMemo(() => {
    if (hasPlayedToday && existingResult) {
      const base = {
        score: existingResult.score ?? summary.score,
        passes: existingResult.passes ?? summary.passes,
        skips: existingResult.skips ?? summary.skips,
        fails: existingResult.fails ?? summary.fails,
        totalTime: existingResult.totalTime ?? summary.totalTime,
      };
      const breakdown = existingResult.breakdown
        ? existingResult.breakdown
        : calculateScoreBreakdown({
            completed: base.passes,
            skips: base.skips,
            fails: base.fails,
            totalTime: base.totalTime,
          });
      return {
        ...base,
        breakdown,
      };
    }
    return summary;
  }, [hasPlayedToday, existingResult, summary]);

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
          breakdown: {
            completionBonus: summary.breakdown.completionBonus,
            accuracyBonus: summary.breakdown.accuracyBonus,
            skipPenalty: summary.breakdown.skipPenalty,
            failPenalty: summary.breakdown.failPenalty,
            timePenalty: summary.breakdown.timePenalty,
          },
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
          setHasPlayedToday(true);
          setExistingResult(payload);
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
    let ignore = false;
    if (!user) {
      setHasPlayedToday(false);
      setExistingResult(null);
      setCountdown(null);
      setCheckingExistingRun(false);
      return;
    }
    setCheckingExistingRun(true);
    const dailyRef = doc(db, 'dailyGauntlets', todayId, 'results', user.uid);
    getDoc(dailyRef)
      .then((snapshot) => {
        if (ignore) return;
        if (snapshot.exists()) {
          setHasPlayedToday(true);
          setExistingResult(snapshot.data());
        } else {
          setHasPlayedToday(false);
          setExistingResult(null);
        }
      })
      .catch((error) => {
        console.error('Failed to check today\'s run', error);
      })
      .finally(() => {
        if (!ignore) {
          setCheckingExistingRun(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [user, todayId]);

  useEffect(() => {
    if (!user || hasPlayedToday || initializing || checkingExistingRun) {
      if (countdown !== null) {
        setCountdown(null);
      }
      return;
    }
    if (countdown === null) {
      setCountdown(3);
    }
  }, [user, hasPlayedToday, initializing, checkingExistingRun, countdown]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return undefined;
    const timeout = globalThis.setTimeout(() => {
      setCountdown((prev) => {
        if (prev === null) return prev;
        return Math.max(prev - 1, 0);
      });
    }, 1000);
    return () => {
      globalThis.clearTimeout(timeout);
    };
  }, [countdown]);

  useEffect(() => {
    setLeaderboard({ daily: [], allTime: [] });
    const dailyQuery = query(
      collection(db, 'dailyGauntlets', todayId, 'results'),
      orderBy('score', 'desc'),
      limit(10),
    );
    const allTimeQuery = query(collection(db, 'runs'), orderBy('score', 'desc'), limit(5));

    const unsubscribeDaily = onSnapshot(
      dailyQuery,
      (snapshot) => {
        setLeaderboard((prev) => ({
          ...prev,
          daily: snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
        }));
      },
      (error) => console.error('Failed to load daily leaderboard', error),
    );
    const unsubscribeAllTime = onSnapshot(
      allTimeQuery,
      (snapshot) => {
        setLeaderboard((prev) => ({
          ...prev,
          allTime: snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
        }));
      },
      (error) => console.error('Failed to load all-time leaderboard', error),
    );

    return () => {
      unsubscribeDaily();
      unsubscribeAllTime();
    };
  }, [todayId]);

  const canPlay = Boolean(user) && !hasPlayedToday && countdown === 0 && !isComplete;
  const countdownActive = countdown !== null && countdown > 0;
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
            <p className="text-sm uppercase tracking-[0.3em] text-blue-400">{formattedToday}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-6 shadow-inner shadow-black/40">
            {initializing ? (
              <div className="space-y-3 text-center text-sm text-slate-300">
                <p>Loading your profile…</p>
              </div>
            ) : !user ? (
              <div className="space-y-4 text-center">
                <h3 className="text-3xl font-semibold text-white">Sign in to play</h3>
                <p className="text-sm text-slate-300">
                  You need to be signed in to attempt today&apos;s Amer Gauntlet and post a score to the leaderboards.
                </p>
                <button
                  type="button"
                  onClick={() => signIn()}
                  className="rounded-full border border-white/40 bg-white/90 px-6 py-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-900 shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  Sign in with Google
                </button>
              </div>
            ) : checkingExistingRun ? (
              <div className="space-y-3 text-center text-sm text-slate-300">
                <p>Checking your progress…</p>
              </div>
            ) : hasPlayedToday && !isComplete ? (
              <div className="space-y-4 text-center">
                <h3 className="text-3xl font-semibold text-white">You already played today</h3>
                <p className="text-sm text-slate-300">
                  Your best score for today is locked in. Come back tomorrow for a fresh gauntlet.
                </p>
                <div className="mx-auto grid max-w-md grid-cols-2 gap-3 text-left text-sm">
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Score</p>
                    <p className="text-2xl font-bold text-white">{displayedSummary.score.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Time</p>
                    <p className="text-2xl font-bold text-white">{formatDuration(displayedSummary.totalTime)}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Passes</p>
                    <p className="text-2xl font-bold text-white">{displayedSummary.passes}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Skips / Fails</p>
                    <p className="text-2xl font-bold text-white">{displayedSummary.skips} / {displayedSummary.fails}</p>
                  </div>
                </div>
                <div className="mx-auto max-w-md">
                  <ScoreBreakdownDetails summary={displayedSummary} />
                </div>
              </div>
            ) : countdownActive || countdown === null ? (
              <div className="space-y-3 text-center text-sm text-slate-300">
                {countdownActive ? (
                  <>
                    <p className="text-3xl font-semibold text-white">Get ready…</p>
                    <p className="text-6xl font-black text-blue-300">{countdown}</p>
                    <p>Focus up! The gauntlet begins when the counter hits zero.</p>
                  </>
                ) : (
                  <p>Preparing your gauntlet…</p>
                )}
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
                    <p className="text-2xl font-bold text-white">{displayedSummary.score.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Time</p>
                    <p className="text-2xl font-bold text-white">{formatDuration(displayedSummary.totalTime)}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Passes</p>
                    <p className="text-2xl font-bold text-white">{displayedSummary.passes}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Skips / Fails</p>
                    <p className="text-2xl font-bold text-white">{displayedSummary.skips} / {displayedSummary.fails}</p>
                  </div>
                </div>
                <div className="mx-auto max-w-lg">
                  <ScoreBreakdownDetails summary={displayedSummary} />
                </div>
                {syncStatus === 'saving' ? (
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Posting to leaderboards…</p>
                ) : syncStatus === 'error' ? (
                  <p className="text-xs uppercase tracking-[0.3em] text-rose-400">Failed to sync score. Try refreshing.</p>
                ) : null}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-6 shadow-inner shadow-black/40">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">Progress</p>
            <p className="mt-2 text-sm text-slate-300">
              {isComplete
                ? 'All challenges complete. Great work!'
                : `Challenge ${nextChallengeNumber} of ${selection.length}`}
            </p>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-blue-400 transition-[width]"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Completed</span>
              <span>{completedCount} / {selection.length}</span>
            </div>
          </div>
        </div>
      </div>
      <aside className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-500/5 backdrop-blur">
          <h3 className="text-xl font-semibold text-white">Leaderboard</h3>
          <div className="mt-5 space-y-6">
            <div>
              <h4 className="text-xs uppercase tracking-[0.3em] text-blue-400">Daily</h4>
              <LeaderboardList entries={leaderboard.daily} />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.3em] text-blue-400">All Time</h4>
              <LeaderboardList entries={leaderboard.allTime} showDate />
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
