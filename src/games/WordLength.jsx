import { useState, useEffect } from 'react';

const WORDS = [
  { word: 'CODE', length: 4 },
  { word: 'GAME', length: 4 },
  { word: 'REACT', length: 5 },
  { word: 'JAVASCRIPT', length: 10 },
  { word: 'PUZZLE', length: 6 },
  { word: 'CHALLENGE', length: 9 },
  { word: 'BRAIN', length: 5 },
  { word: 'LOGIC', length: 5 },
];

export function WordLength({ challenge, onPass, onFail, onSkip }) {
  const [puzzle, setPuzzle] = useState(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setPuzzle(randomWord);
    setGuess('');
    setFeedback('');
  }, [challenge.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numGuess = parseInt(guess);
    if (isNaN(numGuess)) {
      setFeedback('Enter a number');
      return;
    }

    if (numGuess === puzzle.length) {
      setFeedback('Correct!');
      setTimeout(() => onPass(), 500);
    } else {
      setFeedback(numGuess > puzzle.length ? 'Too long!' : 'Too short!');
      onFail();
    }
  };

  if (!puzzle) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-accent-50 mb-2">Word Length</h3>
        <p className="text-quaternary-300 text-sm mb-4">How many letters are in this word?</p>
      </div>

      <div className="bg-primary-700 p-8 rounded-xl text-center">
        <p className="text-5xl font-bold text-tertiary-300 mb-4">{puzzle.word}</p>
        <p className="text-sm text-quaternary-300">Count the letters!</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="number"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          className="w-full p-3 rounded-lg bg-primary-900 border border-tertiary-600 text-accent-50 text-center text-2xl font-mono placeholder-quaternary-500 focus:outline-none focus:ring-2 focus:ring-tertiary-500"
          placeholder="?"
          autoFocus
          min="1"
          max="15"
        />
        <button
          type="submit"
          className="w-full rounded-full border border-tertiary-500/40 bg-tertiary-500/90 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-primary-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-tertiary-400"
        >
          Submit
        </button>
      </form>

      {feedback && (
        <p className={`text-center text-sm font-semibold ${
          feedback.includes('Correct') ? 'text-success-400' : 'text-error-400'
        }`}>
          {feedback}
        </p>
      )}

      <button
        onClick={onSkip}
        className="w-full rounded-full border border-error-500/40 bg-error-500/90 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-error-500"
      >
        Skip
      </button>
    </div>
  );
}

