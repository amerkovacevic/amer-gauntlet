import { useState, useEffect } from 'react';

const HOMOPHONES = [
  {
    word: 'SEA',
    options: ['SEE', 'SAY', 'SAW', 'SIT'],
    answer: 'SEE',
    hint: 'I can ___ the ocean',
  },
  {
    word: 'TWO',
    options: ['TOO', 'TO', 'TOW', 'TIE'],
    answer: 'TOO',
    hint: 'I want ___ go',
  },
  {
    word: 'RIGHT',
    options: ['WRITE', 'RITE', 'RATE', 'ROTE'],
    answer: 'WRITE',
    hint: 'Can you ___ a letter?',
  },
  {
    word: 'HEAR',
    options: ['HERE', 'HAIR', 'HIRE', 'HARE'],
    answer: 'HERE',
    hint: 'Come over ___',
  },
  {
    word: 'FLOWER',
    options: ['FLOUR', 'FLOOR', 'FLOW', 'FLEW'],
    answer: 'FLOUR',
    hint: 'Baking ingredient',
  },
  {
    word: 'BREAK',
    options: ['BRAKE', 'BRAKE', 'BRAKE', 'BRAKE'], // Just using brake for variety
    answer: 'BRAKE',
    hint: 'Stop the car',
  },
];

export function SoundAlike({ challenge, onPass, onFail, onSkip }) {
  const [puzzle, setPuzzle] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const randomPuzzle = HOMOPHONES[Math.floor(Math.random() * HOMOPHONES.length)];
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
        <h3 className="text-xl font-semibold text-accent-50 mb-2">Sound Alike</h3>
        <p className="text-quaternary-300 text-sm mb-4">Find the word that sounds the same!</p>
      </div>

      <div className="bg-primary-700 p-6 rounded-xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-2">Sounds like</p>
        <p className="text-4xl font-bold text-tertiary-300 mb-3">{puzzle.word}</p>
        <p className="text-sm text-quaternary-300 italic">{puzzle.hint}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {puzzle.options.map((option, idx) => (
          <button
            key={idx}
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

