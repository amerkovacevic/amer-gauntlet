import { useState, useEffect } from 'react';

const CATEGORIES = [
  {
    letter: 'A',
    words: ['Apple', 'Animal', 'Amazing', 'Awesome'],
    distractors: ['Banana', 'Cat', 'Dog', 'Elephant'],
  },
  {
    letter: 'B',
    words: ['Bird', 'Brain', 'Brave', 'Beautiful'],
    distractors: ['Apple', 'Cat', 'Dog', 'Elephant'],
  },
  {
    letter: 'C',
    words: ['Cat', 'Code', 'Creative', 'Challenge'],
    distractors: ['Apple', 'Bird', 'Dog', 'Elephant'],
  },
  {
    letter: 'D',
    words: ['Dog', 'Dance', 'Dream', 'Dynamic'],
    distractors: ['Apple', 'Bird', 'Cat', 'Elephant'],
  },
  {
    letter: 'E',
    words: ['Elephant', 'Energy', 'Excellent', 'Eager'],
    distractors: ['Apple', 'Bird', 'Cat', 'Dog'],
  },
];

export function FirstLetter({ challenge, onPass, onFail, onSkip }) {
  const [puzzle, setPuzzle] = useState(null);
  const [selected, setSelected] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const targetWord = randomCategory.words[Math.floor(Math.random() * randomCategory.words.length)];
    const allWords = [...randomCategory.words, ...randomCategory.distractors];
    const shuffled = allWords.sort(() => Math.random() - 0.5).slice(0, 6);
    
    setPuzzle({
      letter: randomCategory.letter,
      target: targetWord,
      options: shuffled,
    });
    setSelected([]);
    setFeedback('');
  }, [challenge.id]);

  const handleSelect = (word) => {
    if (selected.includes(word)) {
      setSelected(selected.filter(w => w !== word));
      return;
    }
    
    const newSelected = [...selected, word];
    setSelected(newSelected);

    if (newSelected.length === 1 && newSelected[0] === puzzle.target) {
      setFeedback('Correct!');
      setTimeout(() => onPass(), 500);
    } else if (newSelected.length === 1) {
      setFeedback('Wrong! Try again.');
      setTimeout(() => {
        setSelected([]);
        setFeedback('');
      }, 1000);
      onFail();
    }
  };

  if (!puzzle) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-accent-50 mb-2">First Letter</h3>
        <p className="text-quaternary-300 text-sm mb-4">Find the word that starts with the letter!</p>
      </div>

      <div className="bg-primary-700 p-6 rounded-xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-tertiary-400 mb-2">Starts with</p>
        <p className="text-6xl font-bold text-tertiary-300">{puzzle.letter}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {puzzle.options.map((word) => (
          <button
            key={word}
            onClick={() => handleSelect(word)}
            disabled={selected.length > 0}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              selected.includes(word)
                ? word === puzzle.target
                  ? 'border-success-500 bg-success-500/20'
                  : 'border-error-500 bg-error-500/20'
                : 'border-tertiary-600 hover:border-tertiary-400 bg-primary-800'
            } ${selected.length > 0 ? 'opacity-50' : ''}`}
          >
            <p className="font-semibold text-accent-50">{word}</p>
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
        disabled={selected.length > 0}
        className="w-full rounded-full border border-error-500/40 bg-error-500/90 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-error-500 disabled:opacity-50"
      >
        Skip
      </button>
    </div>
  );
}

