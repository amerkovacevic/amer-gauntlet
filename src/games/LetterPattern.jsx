import { useState, useEffect } from 'react';

const PATTERNS = [
  { sequence: ['A', 'C', 'E', '?'], answer: 'G' }, // Skip 1 letter
  { sequence: ['B', 'D', 'F', '?'], answer: 'H' }, // Skip 1 letter
  { sequence: ['A', 'D', 'G', '?'], answer: 'J' }, // Skip 2 letters
  { sequence: ['Z', 'X', 'V', '?'], answer: 'T' }, // Reverse, skip 1
  { sequence: ['A', 'B', 'D', '?'], answer: 'E' }, // Fibonacci-like
  { sequence: ['M', 'N', 'O', '?'], answer: 'P' }, // Sequential
  { sequence: ['C', 'F', 'I', '?'], answer: 'L' }, // Skip 2
  { sequence: ['Q', 'R', 'S', '?'], answer: 'T' }, // Sequential
];

export function LetterPattern({ challenge, onPass, onFail, onSkip }) {
  const [pattern, setPattern] = useState(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const randomPattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    setPattern(randomPattern);
    setGuess('');
    setFeedback('');
  }, [challenge.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guess || guess.length !== 1) {
      setFeedback('Enter a single letter');
      return;
    }

    const upperGuess = guess.toUpperCase();
    if (upperGuess === pattern.answer) {
      setFeedback('Correct!');
      setTimeout(() => onPass(), 500);
    } else {
      setFeedback('Wrong! Try again.');
      onFail();
    }
  };

  if (!pattern) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-accent-50 mb-2">Letter Pattern</h3>
        <p className="text-quaternary-300 text-sm mb-4">Complete the pattern!</p>
      </div>

      <div className="bg-primary-700 p-8 rounded-xl text-center">
        <div className="flex gap-4 justify-center items-center">
          {pattern.sequence.map((letter, idx) => (
            <div
              key={idx}
              className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-3xl ${
                letter === '?'
                  ? 'bg-primary-800 border-2 border-tertiary-500 border-dashed'
                  : 'bg-tertiary-500 text-primary-800'
              }`}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => {
            const val = e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 1).toUpperCase();
            setGuess(val);
          }}
          className="w-full p-3 rounded-lg bg-primary-900 border border-tertiary-600 text-accent-50 text-center text-4xl font-bold tracking-widest placeholder-quaternary-500 focus:outline-none focus:ring-2 focus:ring-tertiary-500 uppercase"
          placeholder="?"
          autoFocus
          maxLength={1}
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

