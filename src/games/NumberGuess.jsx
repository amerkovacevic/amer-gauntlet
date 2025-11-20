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
        <h3 className="text-xl font-semibold text-primary-900 mb-2">Number Guess</h3>
        <p className="text-primary-700 text-sm mb-4">Guess the 4-digit number in 6 tries!</p>
      </div>

      <div className="bg-white border border-primary-200 p-6 rounded-xl space-y-3">
        {hints.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-primary-600 mb-2">Previous attempts:</p>
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
                        : 'bg-primary-200 text-primary-600'
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
          className="w-full p-3 rounded-lg bg-white border border-primary-300 text-primary-900 text-center text-2xl font-mono tracking-widest placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-tertiary-500"
          placeholder="0000"
          autoFocus
          maxLength={4}
        />
        <button
          type="submit"
          className="w-full rounded-full border border-primary-300 bg-tertiary-100 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-tertiary-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-tertiary-200"
        >
          Guess
        </button>
      </form>

      {feedback && (
        <p className={`text-center text-sm font-semibold ${
          feedback.includes('Correct') ? 'text-success-700' : 
          feedback.includes('Out of') ? 'text-error-700' : 
          'text-primary-700'
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

