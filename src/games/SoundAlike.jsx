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
        <h3 className="text-xl font-semibold text-primary-900 mb-2">Sound Alike</h3>
        <p className="text-primary-700 text-sm mb-4">Find the word that sounds the same!</p>
      </div>

      <div className="bg-white border border-primary-200 p-6 rounded-xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary-600 mb-2">Sounds like</p>
        <p className="text-4xl font-bold text-primary-900 mb-3">{puzzle.word}</p>
        <p className="text-sm text-primary-700 italic">{puzzle.hint}</p>
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

