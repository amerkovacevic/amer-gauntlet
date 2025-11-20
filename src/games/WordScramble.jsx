import { useState, useEffect } from 'react';

const WORDS = [
  'ADVENTURE', 'CHALLENGE', 'VICTORY', 'PUZZLE', 'BRAIN',
  'LOGIC', 'SPEED', 'SKILL', 'FOCUS', 'MEMORY',
  'QUICK', 'SMART', 'CLEVER', 'SHARP', 'AGILE',
];

function scrambleWord(word) {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters.join('');
}

export function WordScramble({ challenge, onPass, onFail, onSkip }) {
  const [word, setWord] = useState(null);
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(randomWord);
    setScrambled(scrambleWord(randomWord));
  }, [challenge.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (guess.toUpperCase().trim() === word) {
      onPass();
    } else {
      setAttempts(attempts + 1);
      setGuess('');
      if (attempts >= 2) {
        onFail();
      }
    }
  };

  if (!word) return <div className="text-primary-700">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-primary-900 mb-2">Unscramble the Word</h3>
        <p className="text-primary-700 text-sm mb-4">
          Rearrange the letters to form a word
        </p>
        <div className="text-4xl font-bold text-primary-900 tracking-widest mb-6">
          {scrambled}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          placeholder="Your answer"
          className="w-full rounded-lg border border-primary-300 bg-white px-4 py-3 text-center text-lg font-semibold text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-tertiary-400"
          autoFocus
        />
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-full border border-success-300 bg-success-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-success-600"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full border border-error-300 bg-error-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-error-600"
          >
            Skip
          </button>
        </div>
        {attempts > 0 && (
          <p className="text-center text-sm text-warning-700">
            {attempts === 1 ? '1 attempt remaining' : 'Wrong! Try again.'}
          </p>
        )}
      </form>
    </div>
  );
}

