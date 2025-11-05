import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { games } from '../games/index.js';
import { getTodayId } from '../utils/date.js';
import { createSeededRandom, pickFromArray } from '../utils/random.js';

const GauntletContext = createContext();

const STATUS_LOCKED = 'locked';
const STATUS_ACTIVE = 'active';
const STATUS_PASSED = 'passed';
const STATUS_FAILED = 'failed';
const STATUS_SKIPPED = 'skipped';

function createInitialState(gameCount) {
  return {
    startedAt: null,
    finishedAt: null,
    currentIndex: 0,
    currentGameStartedAt: null,
    statuses: Array.from({ length: gameCount }, (_, index) => ({
      index,
      status: index === 0 ? STATUS_ACTIVE : STATUS_LOCKED,
      timeSpent: 0,
    })),
  };
}

export function GauntletProvider({ children }) {
  const todayId = getTodayId();
  
  // Check for debug mode (URL parameter or localStorage)
  const isDebugMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    const urlDebug = urlParams.get('debug') === 'true';
    const storageDebug = window.localStorage.getItem('amer-gauntlet-debug') === 'true';
    return urlDebug || storageDebug;
  }, []);
  
  // Select games for today using seeded random (same games every day)
  // In debug mode, show all games; otherwise show 5
  const selection = useMemo(() => {
    const seeded = createSeededRandom(`gauntlet-${todayId}`);
    const gameCount = isDebugMode ? games.length : 5;
    const picked = pickFromArray(seeded, games, gameCount);
    
    return picked.map((game, index) => ({
      id: game.id,
      name: game.name,
      Component: game.Component,
      challenge: game.createChallenge(`${todayId}-${index}`),
    }));
  }, [todayId, isDebugMode]);

  const [state, setState] = useState(() => createInitialState(selection.length));
  const storageKey = `amer-gauntlet-state-${todayId}`;

  // Load state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cached = window.localStorage.getItem(storageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.statuses) && parsed.statuses.length === selection.length) {
          setState(parsed);
          return;
        }
      } catch (error) {
        console.warn('Failed to parse gauntlet state', error);
      }
    }
    setState(createInitialState(selection.length));
  }, [selection.length, storageKey]);

  // Save state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save gauntlet state', error);
    }
  }, [state, storageKey]);

  const currentGame = useMemo(() => {
    if (state.currentIndex >= selection.length) return null;
    return selection[state.currentIndex];
  }, [selection, state.currentIndex]);

  const isComplete = useMemo(() => {
    return state.statuses.every(
      (status) =>
        status.status === STATUS_PASSED ||
        status.status === STATUS_FAILED ||
        status.status === STATUS_SKIPPED
    );
  }, [state.statuses]);

  const totals = useMemo(() => {
    const passes = state.statuses.filter((s) => s.status === STATUS_PASSED).length;
    const skips = state.statuses.filter((s) => s.status === STATUS_SKIPPED).length;
    const fails = state.statuses.filter((s) => s.status === STATUS_FAILED).length;
    
    // Calculate total time: if finished, use finishedAt - startedAt, otherwise use sum of game times
    let totalTime = 0;
    if (state.finishedAt && state.startedAt) {
      totalTime = (state.finishedAt - state.startedAt) / 1000; // Convert to seconds
    } else if (state.startedAt) {
      // Game in progress - use sum of completed games plus current elapsed time
      const completedTime = state.statuses.reduce((sum, s) => sum + (s.timeSpent || 0), 0);
      const currentElapsed = state.currentGameStartedAt 
        ? (Date.now() - state.currentGameStartedAt) / 1000 
        : 0;
      totalTime = completedTime + currentElapsed;
    }
    
    return { passes, skips, fails, totalTime: Math.max(0, totalTime) };
  }, [state.statuses, state.startedAt, state.finishedAt, state.currentGameStartedAt]);

  const handleOutcome = (index, outcome) => {
    setState((prev) => {
      if (index >= prev.statuses.length) return prev;
      const entry = prev.statuses[index];
      if (entry.status !== STATUS_ACTIVE) return prev;
      
      const now = Date.now();
      const timeSpent = prev.currentGameStartedAt ? (now - prev.currentGameStartedAt) / 1000 : 0;
      const statuses = [...prev.statuses];
      statuses[index] = {
        ...entry,
        status: outcome,
        timeSpent,
      };

      const nextIndex = index + 1;
      if (nextIndex < statuses.length) {
        statuses[nextIndex] = {
          ...statuses[nextIndex],
          status: STATUS_ACTIVE,
          timeSpent: 0,
        };
      }

      return {
        ...prev,
        statuses,
        currentIndex: nextIndex,
        currentGameStartedAt: nextIndex < statuses.length ? now : null,
        finishedAt: nextIndex >= statuses.length ? now : prev.finishedAt,
      };
    });
  };

  const startGame = () => {
    setState((prev) => ({
      ...prev,
      startedAt: Date.now(),
      currentGameStartedAt: Date.now(),
    }));
  };

  const value = useMemo(
    () => ({
      todayId,
      selection,
      state,
      currentGame,
      isComplete,
      totals,
      recordPass: (index) => handleOutcome(index, STATUS_PASSED),
      recordFail: (index) => handleOutcome(index, STATUS_FAILED),
      recordSkip: (index) => handleOutcome(index, STATUS_SKIPPED),
      startGame,
    }),
    [todayId, selection, state, currentGame, isComplete, totals]
  );

  return <GauntletContext.Provider value={value}>{children}</GauntletContext.Provider>;
}

export function useGauntlet() {
  const context = useContext(GauntletContext);
  if (!context) {
    throw new Error('useGauntlet must be used within GauntletProvider');
  }
  return context;
}
