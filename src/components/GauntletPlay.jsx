import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useGauntlet } from '../contexts/GauntletContext.jsx';
import { calculateScore, formatScore } from '../utils/scoring.js';
import { formatDate, formatDuration } from '../utils/date.js';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase.js';

function LeaderboardList({ entries, showDate = false }) {
  if (entries.length === 0) {
    return (
      <p className="mt-2 text-sm text-quaternary-400">No entries yet.</p>
    );
  }

  return (
    <ul className="mt-2 space-y-2">
      {entries.map((entry, index) => (
        <li
          key={entry.id}
          className="flex items-center justify-between rounded-xl border border-tertiary-500/30 bg-primary-800/60 px-4 py-2 text-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary-300">
              #{index + 1}
            </span>
            <span className="font-semibold text-accent-50">{entry.displayName}</span>
            {showDate && (
              <span className="text-xs text-quaternary-400">{entry.date}</span>
            )}
          </div>
          <span className="font-mono text-tertiary-200">{formatScore(entry.score)}</span>
        </li>
      ))}
    </ul>
  );
}

export function GauntletPlay() {
  const { user, signIn, initializing } = useAuth();
  const gauntlet = useGauntlet();
  const { todayId, selection, state, currentGame, isComplete, totals, recordPass, recordFail, recordSkip, startGame } = gauntlet;
  const { passes, skips, fails, totalTime } = totals;
  const [leaderboard, setLeaderboard] = useState({ daily: [], allTime: [] });
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [previousScore, setPreviousScore] = useState(null);
  const [checkingPrevious, setCheckingPrevious] = useState(true);

  // Check if user has already played today and get their score
  useEffect(() => {
    if (!user || !db) {
      setHasPlayedToday(false);
      setPreviousScore(null);
      setCheckingPrevious(false);
      return;
    }

    setCheckingPrevious(true);
    const dailyRef = doc(db, 'amerGauntlet_dailyGauntlets', todayId, 'results', user.uid);
    getDoc(dailyRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setHasPlayedToday(true);
        setPreviousScore({
          score: data.score || 0,
          passes: data.passes || 0,
          skips: data.skips || 0,
          fails: data.fails || 0,
          totalTime: data.totalTime || 0,
        });
      } else {
        setHasPlayedToday(false);
        setPreviousScore(null);
      }
      setCheckingPrevious(false);
    }).catch((error) => {
      console.error('Error checking previous score:', error);
      setHasPlayedToday(false);
      setPreviousScore(null);
      setCheckingPrevious(false);
    });
  }, [user, db, todayId]);

  // Load leaderboards
  useEffect(() => {
    if (!db) return;

    const dailyQuery = query(
      collection(db, 'amerGauntlet_dailyGauntlets', todayId, 'results'),
      orderBy('score', 'desc'),
      orderBy('totalTime', 'asc')
    );
    const allTimeQuery = query(
      collection(db, 'amerGauntlet_runs'),
      orderBy('score', 'desc'),
      orderBy('totalTime', 'asc')
    );

    const unsubscribeDaily = onSnapshot(
      dailyQuery,
      (snapshot) => {
        setLeaderboard((prev) => ({
          ...prev,
          daily: snapshot.docs.slice(0, 10).map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })),
        }));
      },
      (error) => {
        console.error('Error loading daily leaderboard:', error);
        // If index missing, try simpler query with just score
        const simpleDailyQuery = query(
          collection(db, 'amerGauntlet_dailyGauntlets', todayId, 'results'),
          orderBy('score', 'desc')
        );
        onSnapshot(
          simpleDailyQuery,
          (snapshot) => {
            const entries = snapshot.docs.slice(0, 10).map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            }));
            // Sort by totalTime in memory as fallback (for entries with same score)
            entries.sort((a, b) => {
              if (a.score !== b.score) return 0; // Already sorted by score from query
              return (a.totalTime || Infinity) - (b.totalTime || Infinity);
            });
            setLeaderboard((prev) => ({
              ...prev,
              daily: entries,
            }));
          },
          (fallbackError) => {
            console.error('Error loading daily leaderboard (fallback):', fallbackError);
          }
        );
      }
    );

    const unsubscribeAllTime = onSnapshot(
      allTimeQuery,
      (snapshot) => {
        setLeaderboard((prev) => ({
          ...prev,
          allTime: snapshot.docs.slice(0, 5).map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })),
        }));
      },
      (error) => {
        console.error('Error loading all-time leaderboard:', error);
        // If index missing, try simpler query with just score
        const simpleAllTimeQuery = query(
          collection(db, 'amerGauntlet_runs'),
          orderBy('score', 'desc')
        );
        onSnapshot(
          simpleAllTimeQuery,
          (snapshot) => {
            const entries = snapshot.docs.slice(0, 5).map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            }));
            // Sort by totalTime in memory as fallback (for entries with same score)
            entries.sort((a, b) => {
              if (a.score !== b.score) return 0; // Already sorted by score from query
              return (a.totalTime || Infinity) - (b.totalTime || Infinity);
            });
            setLeaderboard((prev) => ({
              ...prev,
              allTime: entries,
            }));
          },
          (fallbackError) => {
            console.error('Error loading all-time leaderboard (fallback):', fallbackError);
          }
        );
      }
    );

    return () => {
      unsubscribeDaily();
      unsubscribeAllTime();
    };
  }, [todayId, db]);

  // Sync results to Firestore when complete
  useEffect(() => {
    if (!isComplete || !user || !db || hasPlayedToday || checkingPrevious) return;

    const score = calculateScore(passes, skips, fails, totalTime);
    const runId = `${todayId}-${user.uid}`;

    const payload = {
      uid: user.uid,
      displayName: user.displayName || 'Player',
      score: score.total,
      passes,
      skips,
      fails,
      totalTime: Math.round(totalTime * 100) / 100, // Round to 2 decimal places
      date: todayId,
      completedAt: serverTimestamp(),
    };

    const dailyRef = doc(db, 'amerGauntlet_dailyGauntlets', todayId, 'results', user.uid);
    const runsRef = doc(db, 'amerGauntlet_runs', runId);

    // Save to both collections with proper error handling
    Promise.all([
      setDoc(dailyRef, payload, { merge: true }),
      setDoc(runsRef, payload, { merge: true })
    ])
      .then(() => {
        // Update local state after successful save
        setHasPlayedToday(true);
        setPreviousScore({
          score: score.total,
          passes,
          skips,
          fails,
          totalTime,
        });
        console.log('Score saved successfully to leaderboard');
      })
      .catch((error) => {
        console.error('Error saving score to leaderboard:', error);
        // Provide more specific error information
        if (error.code === 'permission-denied') {
          console.error('Permission denied: Check Firestore security rules');
        } else if (error.code === 'unavailable') {
          console.error('Firestore temporarily unavailable. Score may not be saved.');
        } else {
          console.error('Unexpected error:', error.code, error.message);
        }
      });
  }, [isComplete, user, db, todayId, passes, skips, fails, totalTime, hasPlayedToday, checkingPrevious]);

  if (initializing) {
    return (
      <div className="rounded-3xl border border-tertiary-500/30 bg-secondary-700/70 p-8 text-center">
        <p className="text-quaternary-300">Loading your profile…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-tertiary-500/30 bg-secondary-700/70 p-8 text-center">
        <h2 className="text-2xl font-semibold text-accent-50 mb-4">Sign in to play</h2>
        <p className="text-quaternary-300 mb-6">
          You need to be signed in to attempt today&apos;s Amer Gauntlet and post a score to the leaderboards.
        </p>
        <button
          type="button"
          onClick={() => signIn()}
          className="rounded-full border border-tertiary-500/40 bg-accent-50/90 px-8 py-3 text-sm font-bold uppercase tracking-[0.3em] text-primary-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-accent-50"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // Game hasn't started yet
  if (!state.startedAt) {
    // Show previous score if user already played today
    if (hasPlayedToday && previousScore) {
      const score = calculateScore(previousScore.passes, previousScore.skips, previousScore.fails, previousScore.totalTime);
      return (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-tertiary-500/30 bg-secondary-700/70 p-8">
            <h2 className="text-2xl font-semibold text-accent-50 mb-2 text-center">You&apos;ve Already Played Today</h2>
            <p className="text-quaternary-300 text-center mb-6">{formatDate(todayId)}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border border-tertiary-500/30 bg-primary-800/60 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-1">Score</p>
                <p className="text-3xl font-bold text-accent-50">{formatScore(score.total)}</p>
              </div>
              <div className="rounded-xl border border-tertiary-500/30 bg-primary-800/60 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-1">Time</p>
                <p className="text-3xl font-bold text-accent-50">{formatDuration(previousScore.totalTime)}</p>
              </div>
              <div className="rounded-xl border border-tertiary-500/30 bg-primary-800/60 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-1">Passes</p>
                <p className="text-2xl font-bold text-success-400">{previousScore.passes}</p>
              </div>
              <div className="rounded-xl border border-tertiary-500/30 bg-primary-800/60 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-1">Skips / Fails</p>
                <p className="text-2xl font-bold text-warning-400">{previousScore.skips} / {previousScore.fails}</p>
              </div>
            </div>
            <p className="text-center text-sm text-quaternary-300">
              Come back tomorrow for a new challenge!
            </p>
          </div>
          <aside className="space-y-6">
            <div className="rounded-3xl border border-tertiary-500/30 bg-secondary-700/70 p-6">
              <h3 className="text-xl font-semibold text-accent-50 mb-4">Leaderboard</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-2">Daily</h4>
                  <LeaderboardList entries={leaderboard.daily} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-2">All Time</h4>
                  <LeaderboardList entries={leaderboard.allTime} showDate />
                </div>
              </div>
            </div>
          </aside>
        </div>
      );
    }

    // Show ready to start screen
    return (
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-tertiary-500/30 bg-secondary-700/70 p-8 text-center">
          <h2 className="text-2xl font-semibold text-accent-50 mb-4">Ready to start?</h2>
          <p className="text-quaternary-300 mb-6">
            You&apos;ll face {selection.length} challenges today. Once you start, the timer begins!
          </p>
          {checkingPrevious ? (
            <p className="text-quaternary-300">Checking your progress...</p>
          ) : (
            <button
              type="button"
              onClick={startGame}
              disabled={hasPlayedToday}
              className="rounded-full border border-tertiary-500/40 bg-tertiary-400/90 px-8 py-3 text-sm font-bold uppercase tracking-[0.3em] text-primary-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-tertiary-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Gauntlet
            </button>
          )}
        </div>
        <aside className="space-y-6">
          <div className="rounded-3xl border border-tertiary-500/30 bg-secondary-700/70 p-6">
            <h3 className="text-xl font-semibold text-accent-50 mb-4">Leaderboard</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-2">Daily</h4>
                <LeaderboardList entries={leaderboard.daily} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-2">All Time</h4>
                <LeaderboardList entries={leaderboard.allTime} showDate />
              </div>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  // Game is complete
  if (isComplete) {
    const score = calculateScore(passes, skips, fails, totalTime);
    return (
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-tertiary-500/30 bg-secondary-700/70 p-8">
          <h2 className="text-3xl font-semibold text-accent-50 mb-2 text-center">Gauntlet Complete!</h2>
          <p className="text-quaternary-300 text-center mb-6">{formatDate(todayId)}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-tertiary-500/30 bg-primary-800/60 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-1">Score</p>
              <p className="text-3xl font-bold text-accent-50">{formatScore(score.total)}</p>
            </div>
            <div className="rounded-xl border border-tertiary-500/30 bg-primary-800/60 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-1">Time</p>
              <p className="text-3xl font-bold text-accent-50">{formatDuration(totalTime)}</p>
            </div>
            <div className="rounded-xl border border-tertiary-500/30 bg-primary-800/60 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-1">Passes</p>
              <p className="text-2xl font-bold text-success-400">{passes}</p>
            </div>
            <div className="rounded-xl border border-tertiary-500/30 bg-primary-800/60 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-1">Skips / Fails</p>
              <p className="text-2xl font-bold text-warning-400">{skips} / {fails}</p>
            </div>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="rounded-3xl border border-tertiary-500/30 bg-secondary-700/70 p-6">
            <h3 className="text-xl font-semibold text-accent-50 mb-4">Leaderboard</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-2">Daily</h4>
                <LeaderboardList entries={leaderboard.daily} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-2">All Time</h4>
                <LeaderboardList entries={leaderboard.allTime} showDate />
              </div>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  // Active game
  if (currentGame && currentGame.Component) {
    const ActiveGameComponent = currentGame.Component;
    const currentIndex = state.currentIndex;
    const completed = passes + fails + skips;
    const progress = (completed / selection.length) * 100;

    return (
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-tertiary-500/30 bg-secondary-700/70 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-accent-50 mb-2">
              Challenge {currentIndex + 1} of {selection.length}
            </h2>
            <p className="text-tertiary-400 text-sm">{currentGame.name}</p>
          </div>

          <ActiveGameComponent
            challenge={currentGame.challenge}
            onPass={() => recordPass(currentIndex)}
            onFail={() => recordFail(currentIndex)}
            onSkip={() => recordSkip(currentIndex)}
          />
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-tertiary-500/30 bg-secondary-700/70 p-6">
            <h3 className="text-xl font-semibold text-accent-50 mb-4">Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-quaternary-300">Completed</span>
                <span className="text-accent-50">{completed} / {selection.length}</span>
              </div>
              <div className="h-2 rounded-full bg-primary-800/60">
                <div
                  className="h-2 rounded-full bg-tertiary-400 transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-quaternary-400">Passes</p>
                <p className="text-lg font-bold text-success-400">{passes}</p>
              </div>
              <div>
                <p className="text-quaternary-400">Skips</p>
                <p className="text-lg font-bold text-warning-400">{skips}</p>
              </div>
              <div>
                <p className="text-quaternary-400">Fails</p>
                <p className="text-lg font-bold text-error-400">{fails}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-tertiary-500/30 bg-secondary-700/70 p-6">
            <h3 className="text-xl font-semibold text-accent-50 mb-4">Leaderboard</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-2">Daily</h4>
                <LeaderboardList entries={leaderboard.daily} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-2">All Time</h4>
                <LeaderboardList entries={leaderboard.allTime} showDate />
              </div>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return null;
}
