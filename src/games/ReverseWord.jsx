import { useState, useEffect } from 'react';

const WORDS = [
  { word: 'CODE', reversed: 'EDOC' },
  { word: 'GAME', reversed: 'EMAG' },
  { word: 'REACT', reversed: 'TCAER' },
  { word: 'PUZZLE', reversed: 'ELZZUP' },
  { word: 'BRAIN', reversed: 'NIARB' },
  { word: 'LOGIC', reversed: 'CIGOL' },
  { word: 'CHALLENGE', reversed: 'EGNELLAhC' }, // CHALLENGE reversed
  { word: 'WORDLE', reversed: 'ELDROW' },
];

export function ReverseWord({ challenge, onPass, onFail, onSkip }) {
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
    const upperGuess = guess.toUpperCase().trim();
    const upperReversed = puzzle.reversed.toUpperCase();
    if (upperGuess === upperReversed) {
      setFeedback('Correct!');
      setTimeout(() => onPass(), 500);
    } else {
      setFeedback('Wrong! Try again.');
      onFail();
    }
  };

  if (!puzzle) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-primary-900 mb-2">Reverse Word</h3>
        <p className="text-primary-700 text-sm mb-4">Spell this word backwards!</p>
      </div>

      <div className="bg-white border border-primary-200 p-8 rounded-xl text-center">
        <p className="text-5xl font-bold text-primary-900 mb-4">{puzzle.word}</p>
        <p className="text-sm text-primary-700">Reverse the letters</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          className="w-full p-3 rounded-lg bg-white border border-primary-300 text-primary-900 text-center text-2xl font-mono tracking-wider placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-tertiary-500 uppercase"
          placeholder="Type backwards..."
          autoFocus
        />
        <button
          type="submit"
          className="w-full rounded-full border border-primary-300 bg-tertiary-100 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-tertiary-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-tertiary-200"
        >
          Submit
        </button>
      </form>

      {feedback && (
        <p className={`text-center text-sm font-semibold ${
          feedback.includes('Correct') ? 'text-success-700' : 'text-error-700'
        }`}>
          {feedback}
        </p>
      )}

      <button
        onClick={onSkip}
        className="w-full rounded-full border border-error-300 bg-error-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-error-600"
      >
        Skip
      </button>
    </div>
  );
}

