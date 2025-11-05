import { useState, useEffect } from 'react';

function generateProblem() {
  const operations = ['+', '-', '*'];
  const op = operations[Math.floor(Math.random() * operations.length)];
  let a, b, answer;

  if (op === '+') {
    a = Math.floor(Math.random() * 50) + 10;
    b = Math.floor(Math.random() * 50) + 10;
    answer = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * 50) + 30;
    b = Math.floor(Math.random() * a);
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * 10) + 2;
    b = Math.floor(Math.random() * 10) + 2;
    answer = a * b;
  }

  return { a, b, op, answer };
}

export function QuickMath({ challenge, onPass, onFail, onSkip }) {
  const [problem, setProblem] = useState(null);
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setProblem(generateProblem());
    setAnswer('');
    setAttempts(0);
  }, [challenge.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAnswer = parseInt(answer, 10);
    if (numAnswer === problem.answer) {
      onPass();
    } else {
      setAttempts(attempts + 1);
      setAnswer('');
      if (attempts >= 1) {
        onFail();
      }
    }
  };

  if (!problem) return <div className="text-quaternary-300">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-accent-50 mb-2">Quick Math</h3>
        <p className="text-quaternary-300 text-sm mb-4">
          Solve this as fast as you can!
        </p>
        <div className="text-5xl font-bold text-accent-50 mb-6">
          {problem.a} {problem.op === '*' ? '×' : problem.op} {problem.b} = ?
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
            className="rounded-full border border-warning-500/40 bg-warning-500/90 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-warning-500"
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

