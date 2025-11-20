import { useState, useEffect } from 'react';

const EMOJI_SEQUENCES = [
  { sequence: ['😀', '😃', '😄', '?'], answer: '😁' },
  { sequence: ['🌱', '🌿', '🌳', '?'], answer: '🌲' },
  { sequence: ['⬛', '⬜', '⬛', '?'], answer: '⬜' },
  { sequence: ['1️⃣', '2️⃣', '3️⃣', '?'], answer: '4️⃣' },
  { sequence: ['🔴', '🟠', '🟡', '?'], answer: '🟢' },
  { sequence: ['⭐', '⭐⭐', '⭐⭐⭐', '?'], answer: '⭐⭐⭐⭐' },
  { sequence: ['🐣', '🐥', '🐔', '?'], answer: '🍗' },
  { sequence: ['🌙', '🌕', '🌙', '?'], answer: '🌕' },
];

const EMOJI_OPTIONS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🌱', '🌿', '🌳', '🌲', '🌴', '🌵',
  '⬛', '⬜', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪',
  '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣',
  '🔴', '🟠', '🟡', '🟢', '🔵', '🟣',
  '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐',
  '🐣', '🐥', '🐔', '🍗',
  '🌙', '🌕', '🌖', '🌗',
];

export function EmojiSequence({ challenge, onPass, onFail, onSkip }) {
  const [puzzle, setPuzzle] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const randomPuzzle = EMOJI_SEQUENCES[Math.floor(Math.random() * EMOJI_SEQUENCES.length)];
    const shuffledOptions = [...EMOJI_OPTIONS]
      .filter(e => !randomPuzzle.sequence.includes(e))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const finalOptions = [randomPuzzle.answer, ...shuffledOptions].sort(() => Math.random() - 0.5);
    
    setPuzzle(randomPuzzle);
    setOptions(finalOptions);
    setSelected(null);
    setFeedback('');
  }, [challenge.id]);

  const handleSelect = (emoji) => {
    setSelected(emoji);
    if (emoji === puzzle.answer) {
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
        <h3 className="text-xl font-semibold text-primary-900 mb-2">Emoji Sequence</h3>
        <p className="text-primary-700 text-sm mb-4">Complete the emoji pattern!</p>
      </div>

      <div className="bg-white border border-primary-200 p-8 rounded-xl">
        <div className="flex gap-4 justify-center items-center mb-6">
          {puzzle.sequence.map((emoji, idx) => (
            <div
              key={idx}
              className={`text-6xl ${emoji === '?' ? 'opacity-50' : ''}`}
            >
              {emoji}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {options.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(emoji)}
              disabled={selected !== null}
              className={`p-6 rounded-xl border-2 transition-all text-4xl ${
                selected === emoji
                  ? emoji === puzzle.answer
                    ? 'border-success-400 bg-success-100'
                    : 'border-error-400 bg-error-100'
                  : 'border-primary-300 hover:border-primary-400 bg-white'
              } ${selected !== null ? 'opacity-50' : ''}`}
            >
              {emoji}
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

