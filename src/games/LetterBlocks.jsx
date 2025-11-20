import { useState, useEffect } from 'react';

const WORDS = [
  { word: 'CODE', letters: ['C', 'O', 'D', 'E', 'X', 'Y'] },
  { word: 'GAME', letters: ['G', 'A', 'M', 'E', 'T', 'S'] },
  { word: 'WORD', letters: ['W', 'O', 'R', 'D', 'L', 'E'] },
  { word: 'PLAY', letters: ['P', 'L', 'A', 'Y', 'U', 'N'] },
  { word: 'FUN', letters: ['F', 'U', 'N', 'X', 'Y', 'Z'] },
  { word: 'BEST', letters: ['B', 'E', 'S', 'T', 'A', 'C'] },
];

export function LetterBlocks({ challenge, onPass, onFail, onSkip }) {
  const [puzzle, setPuzzle] = useState(null);
  const [selected, setSelected] = useState([]);
  const [available, setAvailable] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    const shuffled = [...randomWord.letters].sort(() => Math.random() - 0.5);
    
    setPuzzle({
      target: randomWord.word,
      letters: shuffled,
    });
    setSelected([]);
    setAvailable(shuffled);
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
          setAvailable(puzzle.letters);
          setFeedback('');
        }, 1500);
        onFail();
      }
    }
  };

  const handleRemove = (index) => {
    const item = selected[index];
    const originalIndex = puzzle.letters.indexOf(item.letter);
    setSelected(selected.filter((_, i) => i !== index));
    setAvailable([...available, item.letter]);
  };

  if (!puzzle) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-primary-900 mb-2">Letter Blocks</h3>
        <p className="text-primary-700 text-sm mb-4">Form a word using the letter blocks!</p>
      </div>

      <div className="bg-white border border-primary-200 p-6 rounded-xl">
        <div className="mb-4 min-h-[80px] flex items-center justify-center gap-2 flex-wrap">
          {selected.length === 0 ? (
            <p className="text-primary-600 text-sm">Click letters to form a word</p>
          ) : (
            selected.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleRemove(idx)}
                className="w-14 h-14 rounded-lg bg-tertiary-100 text-tertiary-700 font-bold text-xl hover:bg-tertiary-200 transition shadow-lg"
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
              className="w-14 h-14 rounded-lg bg-white border-2 border-primary-300 text-primary-900 font-bold text-xl hover:bg-accent-100 hover:border-tertiary-400 transition shadow"
            >
              {letter}
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
        className="w-full rounded-full border border-error-300 bg-error-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-error-600"
      >
        Skip
      </button>
    </div>
  );
}

