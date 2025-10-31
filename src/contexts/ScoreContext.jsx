import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ScoreContext = createContext(null);

const createInitialState = () => ({
  startedAt: null,
  completedAt: null,
  correct: 0,
  skipped: 0,
});

export function ScoreProvider({ children }) {
  const [state, setState] = useState(() => createInitialState());

  const beginRun = useCallback(() => {
    setState(() => ({
      startedAt: Date.now(),
      completedAt: null,
      correct: 0,
      skipped: 0,
    }));
  }, []);

  const markCorrect = useCallback(() => {
    setState((prev) => ({ ...prev, correct: prev.correct + 1 }));
  }, []);

  const markSkipped = useCallback(() => {
    setState((prev) => ({ ...prev, skipped: prev.skipped + 1 }));
  }, []);

  const completeRun = useCallback(() => {
    setState((prev) => ({ ...prev, completedAt: Date.now() }));
  }, []);

  const reset = useCallback(() => {
    setState(() => createInitialState());
  }, []);

  const buildScore = useCallback((customState) => {
    const { startedAt, completedAt, correct, skipped } = customState ?? state;
    if (!startedAt) {
      return { total: 0, breakdown: { correct: 0, timeBonus: 0, skipPenalty: 0 }, secondsElapsed: 0 };
    }

    const endTime = completedAt ?? Date.now();
    const secondsElapsed = Math.round((endTime - startedAt) / 1000);

    const correctScore = correct * 100;
    const timeBonus = Math.max(0, 500 - secondsElapsed * 8);
    const skipPenalty = skipped * 25;
    const total = Math.max(0, correctScore + timeBonus - skipPenalty);

    return {
      total,
      breakdown: {
        correct: correctScore,
        timeBonus,
        skipPenalty: -skipPenalty,
      },
      secondsElapsed,
      correct,
      skipped,
    };
  }, [state]);

  const value = useMemo(() => ({
    state,
    beginRun,
    completeRun,
    markCorrect,
    markSkipped,
    reset,
    buildScore,
  }), [state, beginRun, completeRun, markCorrect, markSkipped, reset, buildScore]);

  return <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>;
}

export function useScore() {
  const context = useContext(ScoreContext);
  if (!context) {
    throw new Error('useScore must be used within a ScoreProvider');
  }
  return context;
}
