import { useState, useEffect } from 'react';

const COLOR_OPTIONS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Cyan', hex: '#06b6d4' },
];

export function ColorWord({ challenge, onPass, onFail, onSkip }) {
  const [puzzle, setPuzzle] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Pick a random word (the text content)
    const wordColor = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
    
    // Pick a different random color (the actual color of the text)
    const displayColors = COLOR_OPTIONS.filter(c => c.name !== wordColor.name);
    const actualColor = displayColors[Math.floor(Math.random() * displayColors.length)];
    
    // Randomly decide question type: true = ask for color of text, false = ask for word
    const askForColor = Math.random() > 0.5;
    
    const correctAnswer = askForColor ? actualColor : wordColor;
    
    // Create wrong answer options
    const wrongOptions = COLOR_OPTIONS
      .filter(c => c.name !== correctAnswer.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    setPuzzle({
      word: wordColor.name,
      wordColor: wordColor,
      actualColor: actualColor,
      askForColor: askForColor,
      correctAnswer: correctAnswer,
    });
    setOptions(allOptions);
    setSelected(null);
    setFeedback('');
  }, [challenge.id]);

  const handleSelect = (color) => {
    setSelected(color);
    if (color.name === puzzle.correctAnswer.name) {
      setFeedback('Correct!');
      setTimeout(() => onPass(), 500);
    } else {
      setFeedback(`Wrong! The correct answer is "${puzzle.correctAnswer.name}"`);
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
        <h3 className="text-xl font-semibold text-primary-900 mb-2">Color Word</h3>
        <p className="text-primary-700 text-sm mb-4">
          {puzzle.askForColor 
            ? 'What color is the text?' 
            : 'What word does the text say?'}
        </p>
      </div>

      <div className="bg-white border border-primary-200 p-8 rounded-xl text-center">
        <p 
          className="text-6xl font-bold mb-4"
          style={{ color: puzzle.actualColor.hex }}
        >
          {puzzle.word.toUpperCase()}
        </p>
        <p className="text-sm text-primary-700">
          {puzzle.askForColor 
            ? 'Ignore what the word says, focus on the color!' 
            : 'Focus on the word, ignore the color!'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((color) => (
          <button
            key={color.name}
            onClick={() => handleSelect(color)}
            disabled={selected !== null}
            className={`p-4 rounded-xl border-2 transition-all ${
              selected?.name === color.name
                ? color.name === puzzle.correctAnswer.name
                  ? 'border-success-400 bg-success-100'
                  : 'border-error-400 bg-error-100'
                : 'border-primary-300 hover:border-primary-400 bg-white'
            } ${selected !== null ? 'opacity-50' : ''}`}
          >
            <p className="font-semibold text-primary-900">{color.name}</p>
          </button>
        ))}
      </div>

      {feedback && (
        <p className={`text-center text-sm font-semibold p-3 rounded-xl ${
          feedback.includes('Correct')
            ? 'bg-success-100 text-success-700 border border-success-300'
            : 'bg-error-100 text-error-700 border border-error-300'
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

