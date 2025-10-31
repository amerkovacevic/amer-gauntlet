import { useMemo, useState } from 'react';
import { useFirebase } from './contexts/FirebaseContext.jsx';
import { useGameLibrary } from './contexts/GameLibraryContext.jsx';
import { useScore } from './contexts/ScoreContext.jsx';
import { Leaderboard } from './components/Leaderboard.jsx';
import { logScoreEntry } from './utils/leaderboard.js';

function useTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const { user, signIn, signOut, db } = useFirebase();
  const { getDailyGames } = useGameLibrary();
  const { state, beginRun, completeRun, markCorrect, markSkipped, buildScore, reset } = useScore();

  const todaysGames = useMemo(() => getDailyGames(new Date()), [getDailyGames]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [scoreLogged, setScoreLogged] = useState(false);

  const todayKey = useTodayKey();

  const currentScore = buildScore();
  const challengeStarted = state.startedAt !== null;
  const challengeFinished = state.completedAt !== null || activeIndex >= todaysGames.length;

  const handleStart = () => {
    reset();
    setActiveIndex(0);
    setScoreLogged(false);
    setSubmissionError(null);
    beginRun();
  };

  const handleGameCompleted = async () => {
    const isLastGame = activeIndex >= todaysGames.length - 1;
    if (!isLastGame) {
      setActiveIndex((value) => value + 1);
      return;
    }

    const completedAt = Date.now();
    completeRun();
    setActiveIndex(todaysGames.length);

    if (!user) {
      setSubmissionError(new Error('You must be signed in to submit a score.'));
      return;
    }

    const finalScore = buildScore({ ...state, completedAt });

    if (scoreLogged || finalScore.total <= 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await logScoreEntry(db, {
        userId: user.uid,
        displayName: user.displayName ?? user.email ?? 'Anonymous',
        total: finalScore.total,
        breakdown: finalScore.breakdown,
        secondsElapsed: finalScore.secondsElapsed,
        correct: finalScore.correct,
        skipped: finalScore.skipped,
      });
      setScoreLogged(true);
    } catch (error) {
      setSubmissionError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeGame = todaysGames[activeIndex] ?? null;
  const ActiveGameComponent = activeGame?.Component ?? null;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Five Challenge</h1>
          <p className="text-slate-400">Play five bite-sized games every day and climb the leaderboards.</p>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="text-right">
                <p className="text-sm font-medium">{user.displayName ?? user.email}</p>
                <p className="text-xs text-slate-400">Ready to set a new personal best?</p>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                onClick={signOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 transition shadow-lg shadow-brand-500/30"
              onClick={signIn}
            >
              Sign in with Google
            </button>
          )}
        </div>
      </header>

      <main className="grid lg:grid-cols-[2fr_1fr] gap-8 items-start">
        <section className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Today&apos;s Gauntlet</h2>
                <p className="text-sm text-slate-400">{todayKey}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300">
                  <p>{currentScore.total} pts</p>
                  <p className="text-xs text-slate-500">
                    {currentScore.correct} correct · {currentScore.skipped} skipped · {currentScore.secondsElapsed}s
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 transition disabled:opacity-60"
                  onClick={handleStart}
                  disabled={challengeStarted && !challengeFinished}
                >
                  {challengeStarted ? 'In Progress' : 'Start Challenge'}
                </button>
              </div>
            </header>

            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {todaysGames.map((game, index) => {
                const isActive = index === activeIndex;
                const isComplete = index < activeIndex;
                return (
                  <li
                    key={game.title}
                    className={`rounded-2xl border px-4 py-3 transition ${
                      isActive
                        ? 'border-brand-500 bg-brand-500/10'
                        : isComplete
                        ? 'border-green-500/60 bg-green-500/10'
                        : 'border-slate-800 bg-slate-950/40'
                    }`}
                  >
                    <p className="text-sm font-semibold">Game {index + 1}</p>
                    <p className="text-xs text-slate-400">{game.title}</p>
                  </li>
                );
              })}
            </ol>

            <div className="min-h-[240px]">
              {!challengeStarted && (
                <div className="text-center py-10 text-slate-400">
                  <p>Sign in and press “Start Challenge” to begin the countdown.</p>
                </div>
              )}

              {challengeStarted && ActiveGameComponent && (
                <ActiveGameComponent
                  onCorrect={markCorrect}
                  onSkip={markSkipped}
                  onComplete={handleGameCompleted}
                />
              )}

              {challengeFinished && !activeGame && (
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold">Challenge complete!</h3>
                  <p className="text-slate-400">
                    Your run has been recorded. Share your streak and come back tomorrow for new games.
                  </p>
                  <div className="flex justify-center gap-4 text-sm">
                    <span>Score: {currentScore.total} pts</span>
                    <span>{currentScore.correct} correct</span>
                    <span>{currentScore.skipped} skipped</span>
                    <span>{currentScore.secondsElapsed}s</span>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                    onClick={handleStart}
                  >
                    Play again
                  </button>
                </div>
              )}
            </div>

            {submissionError && (
              <p className="text-sm text-red-400">
                {submissionError.message || 'We could not record your score. Please try again later.'}
              </p>
            )}
            {isSubmitting && <p className="text-sm text-slate-400">Saving your score…</p>}
            {scoreLogged && <p className="text-sm text-green-400">Score submitted to all leaderboards!</p>}
          </div>
        </section>

        <aside className="space-y-4">
          <Leaderboard type="daily" bucket={todayKey} limit={5} />
          <Leaderboard type="monthly" limit={5} />
          <Leaderboard type="allTime" limit={5} />
        </aside>
      </main>

      <footer className="text-center text-xs text-slate-500">
        Crafted with React, Tailwind CSS, and Firebase. Plug your own mini-games into the daily rotation.
      </footer>
    </div>
  );
}
