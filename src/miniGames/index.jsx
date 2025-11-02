import { useMemo, useState } from 'react';
import { createSeededRandom } from '../utils/random.js';

function InputGame({ challenge, onPass, onFail, onSkip }) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('playing');

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalized = value.trim().toLowerCase();
    if (!normalized) return;
    if (challenge.accept(normalized)) {
      setStatus('pass');
      onPass();
    } else {
      setStatus('fail');
      onFail();
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-quaternary-400">{challenge.title}</p>
        <h2 className="text-3xl font-semibold text-accent-50">{challenge.prompt}</h2>
        {challenge.hint ? (
          <p className="text-sm text-quaternary-400">{challenge.hint}</p>
        ) : null}
      </header>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
        <input
          type="text"
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full max-w-xs rounded-xl border border-tertiary-600 bg-secondary-700 px-4 py-3 text-center text-lg text-accent-50 placeholder:text-quaternary-500 shadow-lg shadow-primary-800/50 focus:border-tertiary-400 focus:outline-none focus:ring-2 focus:ring-tertiary-500/40"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-tertiary-500 px-6 py-2 text-sm font-semibold text-accent-50 shadow-lg shadow-tertiary-500/30 transition hover:-translate-y-0.5 hover:bg-tertiary-400 active:bg-tertiary-400 touch-manipulation"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full border border-tertiary-600 px-6 py-2 text-sm font-semibold text-quaternary-200 transition hover:border-tertiary-500 hover:text-accent-50 active:border-tertiary-500 active:text-accent-50 touch-manipulation"
          >
            Skip
          </button>
        </div>
        {status === 'fail' ? (
          <p className="text-sm font-medium text-warning-400">Not quite! Try again tomorrow.</p>
        ) : null}
        {status === 'pass' ? (
          <p className="text-sm font-medium text-tertiary-400">Success!</p>
        ) : null}
      </form>
    </div>
  );
}

function MultipleChoiceGame({ challenge, onPass, onFail, onSkip }) {
  const [selection, setSelection] = useState(null);
  const [status, setStatus] = useState('playing');

  const submit = (choice) => {
    setSelection(choice);
    if (challenge.accept(choice)) {
      setStatus('pass');
      onPass();
    } else {
      setStatus('fail');
      onFail();
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-quaternary-400">{challenge.title}</p>
        <h2 className="text-3xl font-semibold text-accent-50">{challenge.prompt}</h2>
      </header>
      <div className="grid gap-3">
        {challenge.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => submit(option)}
            className={`rounded-xl border px-4 py-3 text-lg font-semibold shadow-lg transition hover:-translate-y-0.5 touch-manipulation ${
              selection === option
                ? challenge.accept(option)
                  ? 'border-tertiary-500 bg-tertiary-500/10 text-tertiary-300'
                  : 'border-warning-500 bg-warning-500/10 text-warning-300'
                : 'border-tertiary-600 bg-secondary-700 text-accent-50 hover:border-tertiary-400 active:border-tertiary-400'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full border border-tertiary-600 px-6 py-2 text-sm font-semibold text-quaternary-200 transition hover:border-tertiary-500 hover:text-accent-50 active:border-tertiary-500 active:text-accent-50 touch-manipulation"
        >
          Skip
        </button>
      </div>
      {status === 'fail' ? (
        <p className="text-center text-sm font-medium text-warning-400">Tough luck! That wasn&apos;t it.</p>
      ) : null}
      {status === 'pass' ? (
        <p className="text-center text-sm font-medium text-tertiary-400">Nicely done.</p>
      ) : null}
    </div>
  );
}

function OrderButtonsGame({ challenge, onPass, onFail, onSkip }) {
  const [progress, setProgress] = useState([]);
  const [status, setStatus] = useState('playing');

  const handlePick = (value) => {
    if (status !== 'playing') return;
    const nextProgress = [...progress, value];
    setProgress(nextProgress);
    const expected = challenge.sequence[nextProgress.length - 1];
    if (value !== expected) {
      setStatus('fail');
      onFail();
      return;
    }
    if (nextProgress.length === challenge.sequence.length) {
      setStatus('pass');
      onPass();
    }
  };

  const available = useMemo(
    () => challenge.options.filter((value) => !progress.includes(value)),
    [challenge.options, progress],
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-quaternary-400">{challenge.title}</p>
        <h2 className="text-3xl font-semibold text-accent-50">{challenge.prompt}</h2>
        <p className="text-sm text-quaternary-400">Tap the numbers in ascending order.</p>
      </header>
      <div className="flex flex-wrap justify-center gap-3">
        {available.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handlePick(value)}
            className="rounded-2xl border border-tertiary-600 bg-secondary-700 px-6 py-4 text-2xl font-bold text-tertiary-300 shadow-lg shadow-tertiary-500/10 transition hover:-translate-y-0.5 hover:border-tertiary-400 active:border-tertiary-400 touch-manipulation"
          >
            {value}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2 text-sm text-quaternary-400">
        {progress.map((value) => (
          <span key={value} className="rounded-full border border-tertiary-500/40 px-3 py-1 text-tertiary-300">
            {value}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full border border-tertiary-600 px-6 py-2 text-sm font-semibold text-quaternary-200 transition hover:border-tertiary-500 hover:text-accent-50 active:border-tertiary-500 active:text-accent-50 touch-manipulation"
        >
          Skip
        </button>
      </div>
      {status === 'fail' ? (
        <p className="text-center text-sm font-medium text-warning-400">Out of order! Keep practicing.</p>
      ) : null}
      {status === 'pass' ? (
        <p className="text-center text-sm font-medium text-tertiary-400">Perfect order.</p>
      ) : null}
    </div>
  );
}

function ColorWordGame({ challenge, onPass, onFail, onSkip }) {
  const [status, setStatus] = useState('playing');

  const choose = (choice) => {
    if (challenge.accept(choice)) {
      setStatus('pass');
      onPass();
    } else {
      setStatus('fail');
      onFail();
    }
  };

  return (
    <div className="space-y-6 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-quaternary-400">{challenge.title}</p>
      <h2 className="text-3xl font-semibold text-accent-50">{challenge.prompt}</h2>
      <div className="flex justify-center">
        <div className="rounded-3xl border border-tertiary-600 bg-secondary-700 px-8 py-6 shadow-xl">
          <span
            className="text-4xl font-black"
            style={{ color: challenge.displayColor }}
          >
            {challenge.word}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {challenge.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            className="rounded-xl border border-tertiary-600 bg-secondary-700 px-5 py-3 text-lg font-semibold text-accent-50 shadow-lg transition hover:-translate-y-0.5 hover:border-tertiary-400 active:border-tertiary-400 touch-manipulation"
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full border border-tertiary-600 px-6 py-2 text-sm font-semibold text-quaternary-200 transition hover:border-tertiary-500 hover:text-accent-50 active:border-tertiary-500 active:text-accent-50 touch-manipulation"
        >
          Skip
        </button>
      </div>
      {status === 'fail' ? (
        <p className="text-center text-sm font-medium text-warning-400">Color tricked you this time.</p>
      ) : null}
      {status === 'pass' ? (
        <p className="text-center text-sm font-medium text-tertiary-400">You saw through the illusion.</p>
      ) : null}
    </div>
  );
}

function TrueFalseGame({ challenge, onPass, onFail, onSkip }) {
  const [status, setStatus] = useState('playing');

  const choose = (choice) => {
    if (challenge.accept(choice)) {
      setStatus('pass');
      onPass();
    } else {
      setStatus('fail');
      onFail();
    }
  };

  return (
    <div className="space-y-6 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-quaternary-400">{challenge.title}</p>
      <h2 className="text-3xl font-semibold text-accent-50">{challenge.prompt}</h2>
      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={() => choose('True')}
          className="rounded-full border border-tertiary-500/40 bg-tertiary-500/10 px-8 py-3 text-lg font-semibold text-tertiary-300 shadow-lg shadow-tertiary-500/20 transition hover:-translate-y-0.5 hover:border-tertiary-400 active:border-tertiary-400 touch-manipulation"
        >
          True
        </button>
        <button
          type="button"
          onClick={() => choose('False')}
          className="rounded-full border border-warning-500/40 bg-warning-500/10 px-8 py-3 text-lg font-semibold text-warning-300 shadow-lg shadow-warning-500/20 transition hover:-translate-y-0.5 hover:border-warning-400 active:border-warning-400 touch-manipulation"
        >
          False
        </button>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full border border-tertiary-600 px-6 py-2 text-sm font-semibold text-quaternary-200 transition hover:border-tertiary-500 hover:text-accent-50 active:border-tertiary-500 active:text-accent-50 touch-manipulation"
        >
          Skip
        </button>
      </div>
      {status === 'fail' ? (
        <p className="text-center text-sm font-medium text-warning-400">Not quite.</p>
      ) : null}
      {status === 'pass' ? (
        <p className="text-center text-sm font-medium text-tertiary-400">Correct!</p>
      ) : null}
    </div>
  );
}

function buildArithmeticInputGame(id, name, title, generate) {
  return {
    id,
    name,
    type: 'input',
    description: title,
    createChallenge(seed) {
      const random = createSeededRandom(`${id}-${seed}`);
      const data = generate(random);
      return {
        title: name,
        prompt: data.prompt,
        hint: data.hint,
        accept: (value) => value === String(data.answer).toLowerCase(),
      };
    },
    Component: InputGame,
  };
}

function buildMultipleChoiceGame(id, name, generate) {
  return {
    id,
    name,
    type: 'multiple-choice',
    description: name,
    createChallenge(seed) {
      const random = createSeededRandom(`${id}-${seed}`);
      const data = generate(random);
      return {
        title: name,
        prompt: data.prompt,
        options: data.options,
        accept: (choice) => choice === data.answer,
      };
    },
    Component: MultipleChoiceGame,
  };
}

function buildOrderGame(id, name, generate) {
  return {
    id,
    name,
    type: 'order',
    description: name,
    createChallenge(seed) {
      const random = createSeededRandom(`${id}-${seed}`);
      const data = generate(random);
      return {
        title: name,
        prompt: data.prompt,
        options: data.options,
        sequence: data.sequence,
      };
    },
    Component: OrderButtonsGame,
  };
}

function buildColorWordGame(id, name) {
  const colors = [
    { label: 'Red', css: '#f87171' },
    { label: 'Orange', css: '#fb923c' },
    { label: 'Yellow', css: '#facc15' },
    { label: 'Green', css: '#34d399' },
    { label: 'Blue', css: '#60a5fa' },
    { label: 'Purple', css: '#c084fc' },
  ];
  return {
    id,
    name,
    type: 'color-word',
    description: name,
    createChallenge(seed) {
      const random = createSeededRandom(`${id}-${seed}`);
      const wordIndex = Math.floor(random() * colors.length);
      let colorIndex = Math.floor(random() * colors.length);
      if (colorIndex === wordIndex) {
        colorIndex = (colorIndex + 2) % colors.length;
      }
      const options = [...colors].sort((a, b) => a.label.localeCompare(b.label)).map((item) => item.label);
      const answer = colors[colorIndex].label;
      return {
        title: name,
        prompt: 'Which color is the ink?',
        word: colors[wordIndex].label,
        displayColor: colors[colorIndex].css,
        options,
        accept: (choice) => choice === answer,
      };
    },
    Component: ColorWordGame,
  };
}

function buildTrueFalseGame(id, name, generate) {
  return {
    id,
    name,
    type: 'true-false',
    description: name,
    createChallenge(seed) {
      const random = createSeededRandom(`${id}-${seed}`);
      const data = generate(random);
      return {
        title: name,
        prompt: data.prompt,
        accept: (choice) => choice === (data.answer ? 'True' : 'False'),
      };
    },
    Component: TrueFalseGame,
  };
}

export const miniGames = [
  buildArithmeticInputGame('addition-easy', 'Quick Add', 'Add the numbers', (random) => {
    const a = Math.floor(random() * 30) + 5;
    const b = Math.floor(random() * 30) + 5;
    return {
      prompt: `${a} + ${b} = ?`,
      answer: a + b,
    };
  }),
  buildArithmeticInputGame('subtraction-easy', 'Quick Subtract', 'Subtract the numbers', (random) => {
    const a = Math.floor(random() * 40) + 30;
    const b = Math.floor(random() * 20) + 5;
    return {
      prompt: `${a} - ${b} = ?`,
      answer: a - b,
    };
  }),
  buildArithmeticInputGame('multiplication-basic', 'Fast Multiply', 'Multiply the numbers', (random) => {
    const a = Math.floor(random() * 11) + 2;
    const b = Math.floor(random() * 11) + 2;
    return {
      prompt: `${a} × ${b} = ?`,
      answer: a * b,
    };
  }),
  buildArithmeticInputGame('division-clean', 'Clean Division', 'Divide evenly', (random) => {
    const divisor = Math.floor(random() * 9) + 2;
    const quotient = Math.floor(random() * 9) + 2;
    return {
      prompt: `${divisor * quotient} ÷ ${divisor} = ?`,
      answer: quotient,
    };
  }),
  buildMultipleChoiceGame('percent-finder', 'Percent Finder', (random) => {
    const base = (Math.floor(random() * 9) + 2) * 10;
    const percentOptions = [10, 15, 20, 25, 30];
    const percent = percentOptions[Math.floor(random() * percentOptions.length)];
    const answer = (base * percent) / 100;
    const options = [answer, answer + 5, answer - 5, answer + 10].map((value) => `${value}`);
    const prompt = `What is ${percent}% of ${base}?`;
    return {
      prompt,
      options: options.sort(() => random() - 0.5),
      answer: String(answer),
    };
  }),
  buildMultipleChoiceGame('odd-one-out', 'Odd One Out', (random) => {
    const base = Math.floor(random() * 5) + 2;
    const multiples = Array.from({ length: 3 }, (_, index) => (index + 2) * base);
    const odd = multiples[0] + Math.floor(random() * 5) + 1;
    const options = [...multiples, odd].map(String).sort(() => random() - 0.5);
    return {
      prompt: `Select the number that is not a multiple of ${base}.`,
      options,
      answer: String(odd),
    };
  }),
  buildMultipleChoiceGame('prime-pick', 'Prime Pick', (random) => {
    const primes = [11, 13, 17, 19, 23, 29, 31, 37];
    const composites = [12, 14, 18, 20, 24, 28, 30, 32];
    const answer = primes[Math.floor(random() * primes.length)];
    const options = [answer];
    while (options.length < 4) {
      const candidate = composites[Math.floor(random() * composites.length)];
      if (!options.includes(candidate)) options.push(candidate);
    }
    return {
      prompt: 'Tap the prime number.',
      options: options.map(String).sort(() => random() - 0.5),
      answer: String(answer),
    };
  }),
  buildMultipleChoiceGame('square-search', 'Square Search', (random) => {
    const base = Math.floor(random() * 12) + 3;
    const answer = base * base;
    const options = [answer];
    while (options.length < 4) {
      const delta = Math.floor(random() * 10) + 1;
      const candidate = answer + (random() > 0.5 ? delta : -delta);
      if (candidate > 0 && !options.includes(candidate)) options.push(candidate);
    }
    return {
      prompt: `Which number is ${base} squared?`,
      options: options.map(String).sort(() => random() - 0.5),
      answer: String(answer),
    };
  }),
  buildOrderGame('ascending-order', 'Ascending Order', (random) => {
    const values = Array.from({ length: 4 }, () => Math.floor(random() * 90) + 10);
    const sequence = [...values].sort((a, b) => a - b);
    return {
      prompt: 'Select the numbers from smallest to largest.',
      options: values,
      sequence,
    };
  }),
  buildMultipleChoiceGame('sequence-next', 'Sequence Next', (random) => {
    const start = Math.floor(random() * 10) + 1;
    const step = Math.floor(random() * 5) + 1;
    const sequence = [start, start + step, start + step * 2];
    const answer = start + step * 3;
    const options = [answer, answer + step, answer - step, answer + step * 2];
    return {
      prompt: `What comes next? ${sequence.join(', ')}, …`,
      options: options.map(String).sort(() => random() - 0.5),
      answer: String(answer),
    };
  }),
  buildTrueFalseGame('comparison-check', 'Comparison Check', (random) => {
    const a = Math.floor(random() * 50) + 10;
    const b = Math.floor(random() * 50) + 10;
    const operator = random() > 0.5 ? '>' : '<';
    const truth = operator === '>' ? a > b : a < b;
    return {
      prompt: `${a} ${operator} ${b}`,
      answer: truth,
    };
  }),
  buildTrueFalseGame('parity-check', 'Parity Check', (random) => {
    const value = Math.floor(random() * 90) + 10;
    const isEven = value % 2 === 0;
    const prompt = `${value} is ${isEven ? 'odd' : 'even'}.`;
    return {
      prompt,
      answer: false,
    };
  }),
  buildTrueFalseGame('square-sense', 'Square Sense', (random) => {
    const base = Math.floor(random() * 9) + 2;
    const square = base * base;
    const offset = Math.floor(random() * 6) - 3;
    const candidate = square + offset;
    const answer = offset === 0;
    return {
      prompt: `${candidate} is a perfect square.`,
      answer,
    };
  }),
  buildTrueFalseGame('divisible-test', 'Divisible Test', (random) => {
    const base = Math.floor(random() * 8) + 2;
    const multiplier = Math.floor(random() * 5) + 2;
    const candidate = base * multiplier + (random() > 0.5 ? 0 : Math.floor(random() * base));
    const answer = candidate % base === 0;
    return {
      prompt: `${candidate} is divisible by ${base}.`,
      answer,
    };
  }),
  buildArithmeticInputGame('digit-sum', 'Digit Sum', 'Sum the digits', (random) => {
    const value = Math.floor(random() * 900) + 100;
    const digits = String(value)
      .split('')
      .map((char) => Number(char));
    const answer = digits.reduce((acc, digit) => acc + digit, 0);
    return {
      prompt: `What is the sum of digits in ${value}?`,
      answer,
    };
  }),
  buildArithmeticInputGame('double-double', 'Double Double', 'Double twice', (random) => {
    const value = Math.floor(random() * 50) + 5;
    return {
      prompt: `Double ${value}, then double it again. What do you get?`,
      answer: value * 4,
    };
  }),
  buildMultipleChoiceGame('word-length', 'Word Length', (random) => {
    const words = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot'];
    const word = words[Math.floor(random() * words.length)];
    const answer = `${word.length}`;
    const options = [answer];
    while (options.length < 4) {
      const candidate = `${word.length + Math.floor(random() * 3) - 1}`;
      if (!options.includes(candidate)) options.push(candidate);
    }
    return {
      prompt: `How many letters are in “${word}”?`,
      options: options.sort(() => random() - 0.5),
      answer,
    };
  }),
  buildMultipleChoiceGame('vowel-count', 'Vowel Count', (random) => {
    const words = ['gauntlet', 'victory', 'momentum', 'phoenix', 'nebula'];
    const word = words[Math.floor(random() * words.length)];
    const vowels = word.replace(/[^aeiou]/g, '').length;
    const answer = `${vowels}`;
    const options = [answer];
    while (options.length < 4) {
      const candidate = `${Math.max(0, vowels + Math.floor(random() * 3) - 1)}`;
      if (!options.includes(candidate)) options.push(candidate);
    }
    return {
      prompt: `How many vowels are in “${word}”?`,
      options: options.sort(() => random() - 0.5),
      answer,
    };
  }),
  buildColorWordGame('color-match', 'Color Match'),
  buildMultipleChoiceGame('month-order', 'Month Order', (random) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const index = Math.floor(random() * months.length);
    const prompt = `Which month comes immediately after ${months[index]}?`;
    const answer = months[(index + 1) % months.length];
    const options = [answer];
    while (options.length < 4) {
      const candidate = months[Math.floor(random() * months.length)];
      if (!options.includes(candidate)) options.push(candidate);
    }
    return {
      prompt,
      options: options.sort(() => random() - 0.5),
      answer,
    };
  }),
  buildArithmeticInputGame('two-step-equation', 'Solve for X', 'Solve for x', (random) => {
    const multiplier = Math.floor(random() * 7) + 2;
    const addend = Math.floor(random() * 18) + 2;
    const solution = Math.floor(random() * 9) + 1;
    const result = multiplier * solution + addend;
    return {
      prompt: `${multiplier}x + ${addend} = ${result}. What is x?`,
      answer: solution,
      hint: 'Isolate x by undoing addition and division.',
    };
  }),
  buildMultipleChoiceGame('fraction-compare', 'Fraction Compare', (random) => {
    const numeratorA = Math.floor(random() * 8) + 1;
    const denominatorA = Math.floor(random() * 8) + 2;
    const numeratorB = Math.floor(random() * 8) + 1;
    const denominatorB = Math.floor(random() * 8) + 2;
    const valueA = numeratorA / denominatorA;
    const valueB = numeratorB / denominatorB;
    const options = [`${numeratorA}/${denominatorA}`, `${numeratorB}/${denominatorB}`];
    const bigger = valueA > valueB ? options[0] : options[1];
    while (options.length < 4) {
      const n = Math.floor(random() * 8) + 1;
      const d = Math.floor(random() * 8) + 2;
      const candidate = `${n}/${d}`;
      if (!options.includes(candidate)) options.push(candidate);
    }
    return {
      prompt: 'Which fraction is largest?',
      options: options.sort(() => random() - 0.5),
      answer: bigger,
    };
  }),
  buildMultipleChoiceGame('roman-reader', 'Roman Reader', (random) => {
    const numerals = [
      { numeral: 'XII', value: 12 },
      { numeral: 'XIV', value: 14 },
      { numeral: 'XVIII', value: 18 },
      { numeral: 'XXI', value: 21 },
      { numeral: 'XXIV', value: 24 },
      { numeral: 'XXIX', value: 29 },
    ];
    const choice = numerals[Math.floor(random() * numerals.length)];
    const distractors = [];
    while (distractors.length < 3) {
      const offset = Math.floor(random() * 7) - 3;
      const candidate = choice.value + offset;
      if (candidate > 0 && candidate !== choice.value && !distractors.includes(candidate)) {
        distractors.push(candidate);
      }
    }
    return {
      prompt: `What is ${choice.numeral} in Arabic numerals?`,
      options: [choice.value, ...distractors].map(String).sort(() => random() - 0.5),
      answer: String(choice.value),
    };
  }),
  buildTrueFalseGame('triangle-sum', 'Triangle Sum', (random) => {
    const candidates = [30, 40, 50, 60, 70, 80, 90, 100, 110];
    const angle = candidates[Math.floor(random() * candidates.length)];
    return {
      prompt: `A triangle can have interior angles measuring 90°, 60°, and ${angle}°.`,
      answer: angle === 30,
    };
  }),
  buildMultipleChoiceGame('mental-mix', 'Mental Mix', (random) => {
    const start = Math.floor(random() * 30) + 10;
    const doubled = start * 2;
    const minus = Math.floor(random() * 10) + 3;
    const added = Math.floor(random() * 10) + 4;
    const answer = doubled - minus + added;
    const prompt = `Double ${start}, subtract ${minus}, then add ${added}. What do you get?`;
    const options = [answer];
    while (options.length < 4) {
      const delta = Math.floor(random() * 7) + 1;
      const candidate = answer + (random() > 0.5 ? delta : -delta);
      if (!options.includes(candidate) && candidate > 0) options.push(candidate);
    }
    return {
      prompt,
      options: options.map(String).sort(() => random() - 0.5),
      answer: String(answer),
    };
  }),
];
