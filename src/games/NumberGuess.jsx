import { useState, useEffect } from 'react';

function generateNumber(difficulty = 3) {
  const digits = [];
  for (let i = 0; i < difficulty; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }
  return digits.join('');
}

export function NumberGuess({ challenge, onPass, onFail, onSkip }) {
  const [target, setTarget] = useState('');
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [hints, setHints] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const newTarget = generateNumber(4);
    setTarget(newTarget);
    setGuess('');
    setAttempts(0);
    setHints([]);
    setFeedback('');
  }, [challenge.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (guess.length !== 4) {
      setFeedback('Enter 4 digits');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guess === target) {
      setFeedback('Correct!');
      setTimeout(() => onPass(), 500);
      return;
    }

    // Calculate hints: correct position (green), wrong position (yellow), wrong (gray)
    const targetArr = target.split('');
    const guessArr = guess.split('');
    const newHints = [];

    for (let i = 0; i < 4; i++) {
      if (guessArr[i] === targetArr[i]) {
        newHints.push({ digit: guessArr[i], status: 'correct' });
      } else if (targetArr.includes(guessArr[i])) {
        newHints.push({ digit: guessArr[i], status: 'wrong-pos' });
      } else {
        newHints.push({ digit: guessArr[i], status: 'wrong' });
      }
    }

    setHints([...hints, newHints]);

    if (newAttempts >= 6) {
      setFeedback(`Out of attempts! The number was ${target}`);
      setTimeout(() => onFail(), 1500);
    } else {
      setGuess('');
      setFeedback(`Try again! (${6 - newAttempts} attempts left)`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-accent-50 mb-2">Number Guess</h3>
        <p className="text-quaternary-300 text-sm mb-4">Guess the 4-digit number in 6 tries!</p>
      </div>

      <div className="bg-primary-700 p-6 rounded-xl space-y-3">
        {hints.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-quaternary-400 mb-2">Previous attempts:</p>
            {hints.map((hint, idx) => (
              <div key={idx} className="flex gap-2 justify-center">
                {hint.map((h, i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                      h.status === 'correct'
                        ? 'bg-success-500 text-white'
                        : h.status === 'wrong-pos'
                        ? 'bg-warning-500 text-white'
                        : 'bg-primary-800 text-quaternary-400'
                    }`}
                  >
                    {h.digit}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
            setGuess(val);
          }}
          className="w-full p-3 rounded-lg bg-primary-900 border border-tertiary-600 text-accent-50 text-center text-2xl font-mono tracking-widest placeholder-quaternary-500 focus:outline-none focus:ring-2 focus:ring-tertiary-500"
          placeholder="0000"
          autoFocus
          maxLength={4}
        />
        <button
          type="submit"
          className="w-full rounded-full border border-tertiary-500/40 bg-tertiary-500/90 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-primary-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-tertiary-400"
        >
          Guess
        </button>
      </form>

      {feedback && (
        <p className={`text-center text-sm font-semibold ${
          feedback.includes('Correct') ? 'text-success-400' : 
          feedback.includes('Out of') ? 'text-error-400' : 
          'text-quaternary-300'
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

