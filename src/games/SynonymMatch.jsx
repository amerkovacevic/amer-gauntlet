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
        <h3 className="text-xl font-semibold text-accent-50 mb-2">Synonym Match</h3>
        <p className="text-quaternary-300 text-sm mb-4">Find the word that means the same!</p>
      </div>

      <div className="bg-primary-700 p-6 rounded-xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-2">Find a synonym for</p>
        <p className="text-4xl font-bold text-accent-50">{puzzle.word}</p>
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
                  ? 'border-success-500 bg-success-500/20'
                  : 'border-error-500 bg-error-500/20'
                : 'border-tertiary-600 hover:border-tertiary-400 bg-primary-800'
            } ${selected !== null ? 'opacity-50' : ''}`}
          >
            <p className="font-semibold text-accent-50">{option}</p>
          </button>
        ))}
      </div>

      {feedback && (
        <p className={`text-center text-sm font-semibold ${
          feedback.includes('Correct') ? 'text-success-400' : 'text-error-400'
        }`}>
          {feedback}
        </p>
      )}

      <button
        onClick={onSkip}
        disabled={selected !== null}
        className="w-full rounded-full border border-warning-500/40 bg-warning-500/90 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-warning-500 disabled:opacity-50"
      >
        Skip
      </button>
    </div>
  );
}

