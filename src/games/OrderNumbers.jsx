import { useState, useEffect } from 'react';

function generateNumbers(count = 5) {
  const numbers = Array.from({ length: 20 }, (_, i) => i + 1);
  const shuffled = [...numbers].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function OrderNumbers({ challenge, onPass, onFail, onSkip }) {
  const [numbers, setNumbers] = useState([]);
  const [ordered, setOrdered] = useState([]);
  const [direction, setDirection] = useState('asc'); // 'asc' or 'desc'
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const dir = Math.random() > 0.5 ? 'asc' : 'desc';
    const nums = generateNumbers(5);
    setNumbers(nums.sort(() => Math.random() - 0.5)); // Shuffle
    setOrdered([]);
    setDirection(dir);
    setFeedback('');
  }, [challenge.id]);

  const handleNumberClick = (num) => {
    if (ordered.includes(num)) return;
    const newOrdered = [...ordered, num];
    setOrdered(newOrdered);

    if (newOrdered.length === numbers.length) {
      // Check if correct
      const correct = direction === 'asc' 
        ? newOrdered.every((n, i) => i === 0 || n > newOrdered[i - 1])
        : newOrdered.every((n, i) => i === 0 || n < newOrdered[i - 1]);

      if (correct) {
        setFeedback('Correct!');
        setTimeout(() => onPass(), 500);
      } else {
        setFeedback('Wrong order! Try again.');
        setOrdered([]);
        onFail();
      }
    }
  };

  const handleReset = () => {
    setOrdered([]);
    setFeedback('');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-primary-900 mb-2">Order Numbers</h3>
        <p className="text-primary-700 text-sm mb-4">
          Click numbers in {direction === 'asc' ? 'ascending' : 'descending'} order!
        </p>
      </div>

      <div className="bg-white border border-primary-200 p-6 rounded-xl">
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              disabled={ordered.includes(num)}
              className={`w-16 h-16 rounded-xl font-bold text-xl transition-all ${
                ordered.includes(num)
                  ? 'bg-tertiary-100 text-tertiary-700 opacity-50 cursor-not-allowed'
                  : 'bg-white text-primary-900 hover:bg-accent-100 hover:scale-105 border-2 border-primary-300'
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        {ordered.length > 0 && (
          <div className="mt-4 pt-4 border-t border-primary-300">
            <p className="text-xs text-primary-600 mb-2">Your order:</p>
            <div className="flex gap-2 justify-center">
              {ordered.map((num, idx) => (
                <div
                  key={idx}
                  className="w-12 h-12 rounded-lg bg-tertiary-100 text-tertiary-700 font-bold text-lg flex items-center justify-center"
                >
                  {num}
                </div>
              ))}
            </div>
            <button
              onClick={handleReset}
              className="mt-3 text-xs text-primary-600 hover:text-primary-900"
            >
              Reset
            </button>
          </div>
        )}
      </div>

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

