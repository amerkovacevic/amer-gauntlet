/**
 * Game Registry
 * 
 * Add new games here with: id, name, Component, createChallenge function
 */

import { WordScramble } from './WordScramble.jsx';
import { ColorWord } from './ColorWord.jsx';
import { OrderNumbers } from './OrderNumbers.jsx';
import { OddOneOut } from './OddOneOut.jsx';
import { EmojiSequence } from './EmojiSequence.jsx';
import { SynonymMatch } from './SynonymMatch.jsx';
import { WordLength } from './WordLength.jsx';
import { ReverseWord } from './ReverseWord.jsx';
import { PersonalTrivia } from './PersonalTrivia.jsx';
import { BubblePop } from './BubblePop.jsx';

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
    id: 'color-word',
    name: 'Color Word',
    Component: ColorWord,
    createChallenge: (challengeId) => ({
      id: challengeId,
      gameId: 'color-word',
    }),
  },
  {
    id: 'order-numbers',
    name: 'Order Numbers',
    Component: OrderNumbers,
    createChallenge: (challengeId) => ({
      id: challengeId,
      gameId: 'order-numbers',
    }),
  },
  {
    id: 'odd-one-out',
    name: 'Odd One Out',
    Component: OddOneOut,
    createChallenge: (challengeId) => ({
      id: challengeId,
      gameId: 'odd-one-out',
    }),
  },
  {
    id: 'emoji-sequence',
    name: 'Emoji Sequence',
    Component: EmojiSequence,
    createChallenge: (challengeId) => ({
      id: challengeId,
      gameId: 'emoji-sequence',
    }),
  },
  {
    id: 'synonym-match',
    name: 'Synonym Match',
    Component: SynonymMatch,
    createChallenge: (challengeId) => ({
      id: challengeId,
      gameId: 'synonym-match',
    }),
  },
  {
    id: 'word-length',
    name: 'Word Length',
    Component: WordLength,
    createChallenge: (challengeId) => ({
      id: challengeId,
      gameId: 'word-length',
    }),
  },
  {
    id: 'reverse-word',
    name: 'Reverse Word',
    Component: ReverseWord,
    createChallenge: (challengeId) => ({
      id: challengeId,
      gameId: 'reverse-word',
    }),
  },
  {
    id: 'personal-trivia',
    name: 'Personal Trivia',
    Component: PersonalTrivia,
    createChallenge: (challengeId) => ({
      id: challengeId,
      gameId: 'personal-trivia',
    }),
  },
  {
    id: 'bubble-pop',
    name: 'Bubble Pop',
    Component: BubblePop,
    createChallenge: (challengeId) => ({
      id: challengeId,
      gameId: 'bubble-pop',
    }),
  },
];

/**
 * Get a game by ID
 */
export function getGameById(gameId) {
  return games.find((game) => game.id === gameId);
}

