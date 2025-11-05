import { useState, useEffect } from 'react';

const WORDS = [
  { word: 'REACT', scrambled: 'TRACE' },
  { word: 'GAME', scrambled: 'MAGE' },
  { word: 'CODE', scrambled: 'DCEO' },
  { word: 'BRAIN', scrambled: 'RABIN' },
  { word: 'LOGIC', scrambled: 'GOLIC' },
  { word: 'PUZZLE', scrambled: 'PULZEZ' },
  { word: 'CHALLENGE', scrambled: 'HALLENGC' },
  { word: 'WORDLE', scrambled: 'DROWLE' },
];

function shuffleString(str) {
  return str.split('').sort(() => Math.random() - 0.5).join('');
}

export function Anagram({ challenge, onPass, onFail, onSkip }) {
  const [puzzle, setPuzzle] = useState(null);
  const [selected, setSelected] = useState([]);
  const [available, setAvailable] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    const scrambled = shuffleString(randomWord.word);
    
    setPuzzle({
      target: randomWord.word,
      scrambled: scrambled,
    });
    setSelected([]);
    setAvailable(scrambled.split(''));
    setFeedback('');
  }, [challenge.id]);

  const handleLetterClick = (letter, index) => {
    if (selected.length >= puzzle.target.length) return;
    
    const newSelected = [...selected, { letter, index }];
    const newAvailable = available.filter((_, i) => i !== index);
    
    setSelected(newSelected);
    setAvailable(newAvailable);

    if (newSelected.length === puzzle.target.length) {
      const guess = newSelected.map(s => s.letter).join('');
      if (guess === puzzle.target) {
        setFeedback('Correct!');
        setTimeout(() => onPass(), 500);
      } else {
        setFeedback('Wrong! Try again.');
        setTimeout(() => {
          setSelected([]);
          setAvailable(puzzle.scrambled.split(''));
          setFeedback('');
        }, 1500);
        onFail();
      }
    }
  };

  const handleRemove = (index) => {
    const item = selected[index];
    setSelected(selected.filter((_, i) => i !== index));
    setAvailable([...available, item.letter]);
  };

  if (!puzzle) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-accent-50 mb-2">Anagram</h3>
        <p className="text-quaternary-300 text-sm mb-4">Rearrange the letters to form a word!</p>
      </div>

      <div className="bg-primary-700 p-6 rounded-xl">
        <div className="mb-4 min-h-[60px] flex items-center justify-center gap-2 flex-wrap">
          {selected.length === 0 ? (
            <p className="text-quaternary-400 text-sm">Select letters to form a word</p>
          ) : (
            selected.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleRemove(idx)}
                className="w-12 h-12 rounded-lg bg-tertiary-500 text-primary-800 font-bold text-xl hover:bg-tertiary-400 transition"
              >
                {item.letter}
              </button>
            ))
          )}
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          {available.map((letter, index) => (
            <button
              key={index}
              onClick={() => handleLetterClick(letter, index)}
              className="w-12 h-12 rounded-lg bg-primary-800 border-2 border-tertiary-600 text-accent-50 font-bold text-xl hover:bg-tertiary-600 hover:border-tertiary-400 transition"
            >
              {letter}
            </button>
          ))}
        </div>
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
        className="w-full rounded-full border border-warning-500/40 bg-warning-500/90 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-warning-500"
      >
        Skip
      </button>
    </div>
  );
}

