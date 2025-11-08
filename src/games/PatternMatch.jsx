import { useState, useEffect } from 'react';

const PATTERNS = [
  { sequence: [1, 2, 3, 4], next: 5 },
  { sequence: [2, 4, 6, 8], next: 10 },
  { sequence: [1, 4, 9, 16], next: 25 },
  { sequence: [5, 10, 15, 20], next: 25 },
  { sequence: [3, 6, 12, 24], next: 48 },
  { sequence: [1, 3, 6, 10], next: 15 },
  { sequence: [2, 5, 11, 23], next: 47 },
];

export function PatternMatch({ challenge, onPass, onFail, onSkip }) {
  const [pattern, setPattern] = useState(null);
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const randomPattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    setPattern(randomPattern);
    setAnswer('');
    setAttempts(0);
  }, [challenge.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAnswer = parseInt(answer, 10);
    if (numAnswer === pattern.next) {
      onPass();
    } else {
      setAttempts(attempts + 1);
      setAnswer('');
      if (attempts >= 1) {
        onFail();
      }
    }
  };

  if (!pattern) return <div className="text-quaternary-300">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-accent-50 mb-2">Find the Pattern</h3>
        <p className="text-quaternary-300 text-sm mb-4">
          What number comes next?
        </p>
        <div className="flex items-center justify-center gap-4 mb-6">
          {pattern.sequence.map((num, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="rounded-lg border-2 border-tertiary-400 bg-tertiary-500/20 px-4 py-2 text-2xl font-bold text-accent-50 min-w-[60px]">
                {num}
              </div>
              {i < pattern.sequence.length - 1 && (
                <span className="text-tertiary-400 text-xl">→</span>
              )}
            </div>
          ))}
          <span className="text-tertiary-400 text-xl">→</span>
          <div className="rounded-lg border-2 border-dashed border-tertiary-400/50 bg-primary-800/40 px-4 py-2 text-2xl font-bold text-quaternary-400 min-w-[60px]">
            ?
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer"
          className="w-full rounded-lg border border-tertiary-500/30 bg-primary-800/60 px-4 py-3 text-center text-lg font-semibold text-accent-50 placeholder-quaternary-400 focus:outline-none focus:ring-2 focus:ring-tertiary-400"
          autoFocus
        />
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-full border border-success-500/40 bg-success-500/90 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-success-500"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full border border-error-500/40 bg-error-500/90 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-error-500"
          >
            Skip
          </button>
        </div>
        {attempts > 0 && (
          <p className="text-center text-sm text-warning-400">
            Wrong! Try again.
          </p>
        )}
      </form>
    </div>
  );
}

