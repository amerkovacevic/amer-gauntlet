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
        <h3 className="text-xl font-semibold text-primary-900 mb-2">Missing Vowel</h3>
        <p className="text-primary-700 text-sm mb-4">Fill in the missing vowel!</p>
      </div>

      <div className="bg-white border border-primary-200 p-8 rounded-xl text-center">
        <div className="flex gap-2 justify-center items-center">
          {displayWord.split('').map((char, idx) => (
            <div
              key={idx}
              className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-2xl ${
                char === '_'
                  ? 'bg-white border-2 border-primary-300 border-dashed text-primary-600'
                  : 'bg-tertiary-100 text-tertiary-700'
              }`}
            >
              {char}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-primary-700">Find the missing vowel</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => {
            const val = e.target.value.replace(/[^aeiouAEIOU]/g, '').slice(0, 1).toUpperCase();
            setGuess(val);
          }}
          className="w-full p-3 rounded-lg bg-white border border-primary-300 text-primary-900 text-center text-4xl font-bold tracking-widest placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-tertiary-500 uppercase"
          placeholder="A"
          autoFocus
          maxLength={1}
        />
        <button
          type="submit"
          className="w-full rounded-full border border-primary-300 bg-tertiary-100 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-tertiary-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-tertiary-200"
        >
          Submit
        </button>
      </form>

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

