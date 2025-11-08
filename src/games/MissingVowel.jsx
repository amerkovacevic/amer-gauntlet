import { useState, useEffect } from 'react';

const WORDS = [
  { word: 'REACT', missing: [1, 3], answer: 'E' }, // R_E_C_T -> E
  { word: 'JAVASCRIPT', missing: [1, 3, 5], answer: 'A' }, // J_A_V_A_S_C_R_I_P_T -> A
  { word: 'CODE', missing: [1], answer: 'O' }, // C_O_D_E -> O
  { word: 'GAME', missing: [1], answer: 'A' }, // G_A_M_E -> A
  { word: 'CHALLENGE', missing: [2, 5], answer: 'A' }, // C_H_A_L_L_E_N_G_E -> A
  { word: 'PUZZLE', missing: [1, 4], answer: 'U' }, // P_U_Z_Z_L_E -> U
  { word: 'BRAIN', missing: [2], answer: 'A' }, // B_R_A_I_N -> A
  { word: 'LOGIC', missing: [1], answer: 'O' }, // L_O_G_I_C -> O
];

function removeVowels(word, indices) {
  return word.split('').map((char, idx) => 
    indices.includes(idx) ? '_' : char
  ).join('');
}

export function MissingVowel({ challenge, onPass, onFail, onSkip }) {
  const [puzzle, setPuzzle] = useState(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setPuzzle(randomWord);
    setGuess('');
    setFeedback('');
  }, [challenge.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guess || guess.length !== 1) {
      setFeedback('Enter a single letter');
      return;
    }

    const upperGuess = guess.toUpperCase();
    if (upperGuess === puzzle.answer) {
      setFeedback('Correct!');
      setTimeout(() => onPass(), 500);
    } else {
      setFeedback('Wrong! Try again.');
      onFail();
    }
  };

  if (!puzzle) return null;

  const displayWord = removeVowels(puzzle.word, puzzle.missing);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-accent-50 mb-2">Missing Vowel</h3>
        <p className="text-quaternary-300 text-sm mb-4">Fill in the missing vowel!</p>
      </div>

      <div className="bg-primary-700 p-8 rounded-xl text-center">
        <div className="flex gap-2 justify-center items-center">
          {displayWord.split('').map((char, idx) => (
            <div
              key={idx}
              className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-2xl ${
                char === '_'
                  ? 'bg-primary-800 border-2 border-tertiary-500 border-dashed text-tertiary-400'
                  : 'bg-tertiary-500 text-primary-800'
              }`}
            >
              {char}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-quaternary-300">Find the missing vowel</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => {
            const val = e.target.value.replace(/[^aeiouAEIOU]/g, '').slice(0, 1).toUpperCase();
            setGuess(val);
          }}
          className="w-full p-3 rounded-lg bg-primary-900 border border-tertiary-600 text-accent-50 text-center text-4xl font-bold tracking-widest placeholder-quaternary-500 focus:outline-none focus:ring-2 focus:ring-tertiary-500 uppercase"
          placeholder="A"
          autoFocus
          maxLength={1}
        />
        <button
          type="submit"
          className="w-full rounded-full border border-tertiary-500/40 bg-tertiary-500/90 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-primary-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-tertiary-400"
        >
          Submit
        </button>
      </form>

      {feedback && (
        <p className={`text-center text-sm font-semibold ${
          feedback.includes('Correct') ? 'text-success-400' : 'text-error-400'
        }`}>
          {feedback}
        </p>
      )}

      <button
        onClick={onSkip}
        className="w-full rounded-full border border-error-500/40 bg-error-500/90 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-error-500"
      >
        Skip
      </button>
    </div>
  );
}

