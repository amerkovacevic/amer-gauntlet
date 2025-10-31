import { createContext, useContext, useMemo } from 'react';

const GameLibraryContext = createContext(null);

const stubGame = (title) => ({
  title,
  description: 'This mini-game will be implemented soon. Wire it up by using the scoring callbacks.',
  Component: ({ onCorrect, onSkip, onComplete }) => (
    <div className="p-6 text-center border border-dashed border-slate-700 rounded-xl space-y-4">
      <div>
        <p className="text-lg font-semibold mb-2">{title}</p>
        <p className="text-sm text-slate-300 max-w-prose mx-auto">
          Placeholder component. Replace this with the finished mini-game. Use the buttons below to
          simulate player actions while building.
        </p>
      </div>
      <div className="flex justify-center gap-3 flex-wrap">
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-green-500/20 text-green-300 border border-green-500/40"
          onClick={onCorrect}
        >
          Mark Correct Answer
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-200 border border-yellow-500/40"
          onClick={onSkip}
        >
          Mark Skipped Question
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-500/40"
          onClick={onComplete}
        >
          Complete Game
        </button>
      </div>
    </div>
  ),
});

const GAMES = [
  stubGame('Pattern Pulse'),
  stubGame('Quick Recall'),
  stubGame('Mind Maze'),
  stubGame('Lightning Logic'),
  stubGame('Speedy Sort'),
  stubGame('Snap Decisions'),
  stubGame('Word Sprint'),
];

function buildDeterministicPicker(seedValue) {
  let state = seedValue % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function createDailySelection(date) {
  const dateSeed = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
  const seed = Array.from(dateSeed).reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
  const random = buildDeterministicPicker(seed);

  const pool = [...GAMES];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, 5);
}

export function GameLibraryProvider({ children }) {
  const value = useMemo(() => ({
    games: GAMES,
    getDailyGames: (date = new Date()) => createDailySelection(date),
  }), []);

  return <GameLibraryContext.Provider value={value}>{children}</GameLibraryContext.Provider>;
}

export function useGameLibrary() {
  const context = useContext(GameLibraryContext);
  if (!context) {
    throw new Error('useGameLibrary must be used inside a GameLibraryProvider');
  }
  return context;
}
