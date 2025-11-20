import { useState, useEffect } from 'react';

const SYNONYMS = [
  { word: 'Happy', options: ['Joyful', 'Sad', 'Angry', 'Tired'], answer: 'Joyful' },
  { word: 'Big', options: ['Large', 'Small', 'Tiny', 'Medium'], answer: 'Large' },
  { word: 'Fast', options: ['Quick', 'Slow', 'Normal', 'Average'], answer: 'Quick' },
  { word: 'Smart', options: ['Clever', 'Dumb', 'Average', 'Lazy'], answer: 'Clever' },
  { word: 'Brave', options: ['Courageous', 'Scared', 'Nervous', 'Tired'], answer: 'Courageous' },
  { word: 'Small', options: ['Tiny', 'Huge', 'Big', 'Medium'], answer: 'Tiny' },
  { word: 'Beautiful', options: ['Pretty', 'Ugly', 'Plain', 'Normal'], answer: 'Pretty' },
  { word: 'Begin', options: ['Start', 'End', 'Middle', 'Stop'], answer: 'Start' },
];

export function SynonymMatch({ challenge, onPass, onFail, onSkip }) {
  const [puzzle, setPuzzle] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const randomPuzzle = SYNONYMS[Math.floor(Math.random() * SYNONYMS.length)];
    const shuffled = [...randomPuzzle.options].sort(() => Math.random() - 0.5);
    setPuzzle({ ...randomPuzzle, options: shuffled });
    setSelected(null);
    setFeedback('');
  }, [challenge.id]);

  const handleSelect = (option) => {
    setSelected(option);
    if (option === puzzle.answer) {
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
        <h3 className="text-xl font-semibold text-primary-900 mb-2">Synonym Match</h3>
        <p className="text-primary-700 text-sm mb-4">Find the word that means the same!</p>
      </div>

      <div className="bg-white border border-primary-200 p-6 rounded-xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary-600 mb-2">Find a synonym for</p>
        <p className="text-4xl font-bold text-primary-900">{puzzle.word}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {puzzle.options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            disabled={selected !== null}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              selected === option
                ? option === puzzle.answer
                  ? 'border-success-400 bg-success-100'
                  : 'border-error-400 bg-error-100'
                : 'border-primary-300 hover:border-primary-400 bg-white'
            } ${selected !== null ? 'opacity-50' : ''}`}
          >
            <p className="font-semibold text-primary-900">{option}</p>
          </button>
        ))}
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

