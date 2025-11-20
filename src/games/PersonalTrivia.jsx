import { useState, useEffect } from 'react';

// Hardcoded questions and answers (from questions.json)
const TRIVIA_QUESTIONS = [
  {
    question: "What city was Amer born in?",
    correct_answer: "Mostar",
    fake_answers: ["Sarajevo", "St. Louis", "Jablanica"]
  },
  {
    question: "What was Amer's first website project?",
    correct_answer: "RPM Music STL LLC",
    fake_answers: ["KovaTMS", "Personal Portfolio", "Amer Gauntlet"]
  },
  {
    question: "What sport does Amer follow the most?",
    correct_answer: "Soccer",
    fake_answers: ["Basketball", "Tennis", "American football"]
  },
  {
    question: "What's Amer's favorite side project name?",
    correct_answer: "Amer Gauntlet",
    fake_answers: ["Color Crafter", "FM Team Draw", "FlickFeed"]
  },
  {
    question: "Which backend does Amer prefer?",
    correct_answer: "Firebase",
    fake_answers: ["Supabase", "PocketBase", "Appwrite"]
  },
  {
    question: "What's Amer's favorite CSS library?",
    correct_answer: "TailwindCSS",
    fake_answers: ["Bootstrap", "Sugma UI", "Bulma"]
  },
  {
    question: "What team does Amer usually support in the Premier League?",
    correct_answer: "Newcastle United",
    fake_answers: ["Manchester City", "Chelsea", "Liverpool"]
  },
  {
    question: "What does the \"AK\" in AK Tools stand for?",
    correct_answer: "Amer Kovacevic",
    fake_answers: ["Advanced Kit", "Alpha Key", "Auto Komponents"]
  },
  {
    question: "What's the \"Gauntlet\" in Amer Gauntlet based on?",
    correct_answer: "Pirlo Gauntlet",
    fake_answers: ["A dream", "A coding interview buzzword", "Something learned at work"]
  },
  {
    question: "If Amer made a time-tracking app, what would it be called?",
    correct_answer: "Time Buddy",
    fake_answers: ["ClockCraft", "TickTock Pro", "HoursHub"]
  }
];

export function PersonalTrivia({ challenge, onPass, onFail, onSkip }) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Pick a random question
    const randomIndex = Math.floor(Math.random() * TRIVIA_QUESTIONS.length);
    const question = TRIVIA_QUESTIONS[randomIndex];
    
    // Shuffle answers (correct + fake answers)
    const allAnswers = [question.correct_answer, ...question.fake_answers];
    const shuffled = allAnswers.sort(() => Math.random() - 0.5);
    
    setCurrentQuestion(question);
    setAnswers(shuffled);
    setSelected(null);
    setFeedback('');
  }, [challenge.id]);

  const handleSelect = (answer) => {
    if (selected !== null) return; // Already answered
    
    setSelected(answer);
    
    if (answer === currentQuestion.correct_answer) {
      setFeedback('Correct!');
      setTimeout(() => onPass(), 800);
    } else {
      setFeedback(`Wrong! The correct answer is "${currentQuestion.correct_answer}"`);
      setTimeout(() => {
        onFail();
      }, 1500);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-accent-50 mb-2">Personal Trivia</h3>
        <p className="text-primary-700 text-sm mb-4">How well do you know Amer?</p>
      </div>

      <div className="bg-white border border-primary-200 p-6 rounded-xl">
        <p className="text-lg font-semibold text-primary-900 mb-6 text-center">
          {currentQuestion.question}
        </p>

        <div className="space-y-3">
          {answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleSelect(answer)}
              disabled={selected !== null}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selected === answer
                  ? answer === currentQuestion.correct_answer
                    ? 'border-success-400 bg-success-100'
                    : 'border-error-400 bg-error-100'
                  : 'border-primary-300 hover:border-primary-400 bg-white'
              } ${selected !== null ? 'opacity-50' : 'hover:scale-[1.02]'}`}
            >
              <p className="font-medium text-primary-900">{answer}</p>
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className={`text-center text-sm font-semibold p-4 rounded-xl ${
          feedback.includes('Correct')
            ? 'bg-success-100 text-success-700 border border-success-300'
            : 'bg-error-100 text-error-700 border border-error-300'
        }`}>
          {feedback}
        </div>
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

