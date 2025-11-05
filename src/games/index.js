/**
 * Game Registry
 * 
 * Add new games here with: id, name, Component, createChallenge function
 */

import { WordScramble } from './WordScramble.jsx';
import { PatternMatch } from './PatternMatch.jsx';
import { ReactionTime } from './ReactionTime.jsx';
import { MemorySequence } from './MemorySequence.jsx';
import { QuickMath } from './QuickMath.jsx';

export const games = [
  {
    id: 'word-scramble',
    name: 'Word Scramble',
    Component: WordScramble,
    createChallenge: (challengeId) => ({
      id: challengeId,
      gameId: 'word-scramble',
    }),
  },
  {
    id: 'pattern-match',
    name: 'Pattern Match',
    Component: PatternMatch,
    createChallenge: (challengeId) => ({
      id: challengeId,
      gameId: 'pattern-match',
    }),
  },
  {
    id: 'reaction-time',
    name: 'Reaction Time',
    Component: ReactionTime,
    createChallenge: (challengeId) => ({
      id: challengeId,
      gameId: 'reaction-time',
    }),
  },
  {
    id: 'memory-sequence',
    name: 'Memory Sequence',
    Component: MemorySequence,
    createChallenge: (challengeId) => ({
      id: challengeId,
      gameId: 'memory-sequence',
    }),
  },
  {
    id: 'quick-math',
    name: 'Quick Math',
    Component: QuickMath,
    createChallenge: (challengeId) => ({
      id: challengeId,
      gameId: 'quick-math',
    }),
  },
];

/**
 * Get a game by ID
 */
export function getGameById(gameId) {
  return games.find((game) => game.id === gameId);
}

