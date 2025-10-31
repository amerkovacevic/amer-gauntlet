import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { miniGames } from '../miniGames/index.jsx';
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
  const selection = useMemo(() => {
    const seeded = createSeededRandom(`gauntlet-${todayId}`);
    const picks = pickFromArray(seeded, miniGames, 5);
    return picks.map((game, index) => ({
      id: game.id,
      name: game.name,
      Component: game.Component,
      challenge: game.createChallenge(`${todayId}-${index}`),
    }));
  }, [todayId]);

  const [state, setState] = useState(() => createInitialState(selection.length));
  const storageKey = `amer-gauntlet-state-${todayId}`;

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  useEffect(() => {
    if (!state.startedAt) {
      setState((prev) => ({
        ...prev,
        startedAt: Date.now(),
        currentGameStartedAt: Date.now(),
      }));
    }
  }, [state.startedAt]);

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

  const value = useMemo(() => {
    const passes = state.statuses.filter((item) => item.status === STATUS_PASSED).length;
    const skips = state.statuses.filter((item) => item.status === STATUS_SKIPPED).length;
    const fails = state.statuses.filter((item) => item.status === STATUS_FAILED).length;
    const totalTime = state.finishedAt && state.startedAt
      ? (state.finishedAt - state.startedAt) / 1000
      : state.startedAt
        ? (Date.now() - state.startedAt) / 1000
        : 0;

    return {
      todayId,
      selection,
      state,
      totals: {
        passes,
        skips,
        fails,
        totalTime,
      },
      isComplete: state.finishedAt !== null,
      currentGame: selection[state.currentIndex] || null,
      begin: () => {
        setState((prev) => {
          if (prev.startedAt) return prev;
          const now = Date.now();
          return {
            ...prev,
            startedAt: now,
            currentGameStartedAt: now,
          };
        });
      },
      recordPass: (index) => handleOutcome(index, STATUS_PASSED),
      recordFail: (index) => handleOutcome(index, STATUS_FAILED),
      recordSkip: (index) => handleOutcome(index, STATUS_SKIPPED),
      reset: () => setState(createInitialState(selection.length)),
    };
  }, [selection, state, todayId]);

  return <GauntletContext.Provider value={value}>{children}</GauntletContext.Provider>;
}

export function useGauntlet() {
  return useContext(GauntletContext);
}
