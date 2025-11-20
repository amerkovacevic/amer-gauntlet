import { useState, useEffect } from 'react';

const PUZZLES = [
  {
    items: ['Apple', 'Banana', 'Orange', 'Car'],
    answer: 'Car',
    reason: 'Not a fruit',
  },
  {
    items: ['Dog', 'Cat', 'Bird', 'Tree'],
    answer: 'Tree',
    reason: 'Not an animal',
  },
  {
    items: ['Red', 'Blue', 'Green', 'Happy'],
    answer: 'Happy',
    reason: 'Not a color',
  },
  {
    items: ['Soccer', 'Basketball', 'Tennis', 'Pizza'],
    answer: 'Pizza',
    reason: 'Not a sport',
  },
  {
    items: ['Piano', 'Guitar', 'Violin', 'Book'],
    answer: 'Book',
    reason: 'Not a musical instrument',
  },
  {
    items: ['Monday', 'Tuesday', 'Wednesday', 'January'],
    answer: 'January',
    reason: 'Not a day of week',
  },
];

export function OddOneOut({ challenge, onPass, onFail, onSkip }) {
  const [puzzle, setPuzzle] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const randomPuzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
    const shuffled = [...randomPuzzle.items].sort(() => Math.random() - 0.5);
    setPuzzle({ ...randomPuzzle, items: shuffled });
    setSelected(null);
    setFeedback('');
  }, [challenge.id]);

  const handleSelect = (item) => {
    setSelected(item);
    if (item === puzzle.answer) {
      setFeedback('Correct!');
      setTimeout(() => onPass(), 500);
    } else {
      setFeedback('Wrong! Try again.');
      setTimeout(() => {
        setSelected(null);
        setFeedback('');
      }, 1500);
      onFail();
    }
  };

  if (!puzzle) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-primary-900 mb-2">Odd One Out</h3>
        <p className="text-primary-700 text-sm mb-4">Find the item that doesn't belong!</p>
      </div>

      <div className="bg-white border border-primary-200 p-6 rounded-xl">
        <div className="grid grid-cols-2 gap-3">
          {puzzle.items.map((item) => (
            <button
              key={item}
              onClick={() => handleSelect(item)}
              disabled={selected !== null}
              className={`p-6 rounded-xl border-2 transition-all text-center ${
                selected === item
                  ? item === puzzle.answer
                    ? 'border-success-400 bg-success-100'
                    : 'border-error-400 bg-error-100'
                  : 'border-primary-300 hover:border-primary-400 bg-white'
              } ${selected !== null ? 'opacity-50' : ''}`}
            >
              <p className="font-bold text-lg text-primary-900">{item}</p>
            </button>
          ))}
        </div>
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
        disabled={selected !== null}
        className="w-full rounded-full border border-error-300 bg-error-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-error-600 disabled:opacity-50"
      >
        Skip
      </button>
    </div>
  );
}

