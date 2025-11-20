import { useState, useEffect, useRef } from 'react';

export function ReactionTime({ challenge, onPass, onFail, onSkip }) {
  const [state, setState] = useState('waiting'); // waiting, ready, clicked, done
  const [startTime, setStartTime] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Random delay between 2-5 seconds
    const delay = 2000 + Math.random() * 3000;
    
    timeoutRef.current = setTimeout(() => {
      setState('ready');
      setStartTime(Date.now());
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [challenge.id]);

  const handleClick = () => {
    if (state === 'waiting') {
      // Clicked too early
      onFail();
      return;
    }

    if (state === 'ready') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setState('done');
      
      // Pass if reaction time is under 300ms, fail if over 500ms
      setTimeout(() => {
        if (time < 300) {
          onPass();
        } else if (time > 500) {
          onFail();
        } else {
          onPass(); // Pass for 300-500ms range
        }
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-primary-900 mb-2">Reaction Test</h3>
        <p className="text-primary-700 text-sm mb-4">
          Wait for the screen to turn green, then click as fast as you can!
        </p>
      </div>

      <button
        onClick={handleClick}
        className={`w-full h-64 rounded-2xl border-4 transition-all ${
          state === 'waiting'
            ? 'bg-error-100 border-error-300'
            : state === 'ready'
            ? 'bg-success-500 border-success-500 animate-pulse'
            : state === 'done'
            ? 'bg-tertiary-100 border-tertiary-300'
            : ''
        }`}
      >
        {state === 'waiting' && (
          <div className="text-center">
            <div className="text-4xl font-bold text-error-700 mb-2">Wait...</div>
            <div className="text-primary-700 text-sm">Don't click yet!</div>
          </div>
        )}
        {state === 'ready' && (
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">CLICK NOW!</div>
            <div className="text-white text-sm">As fast as you can!</div>
          </div>
        )}
        {state === 'done' && reactionTime && (
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-900 mb-2">
              {reactionTime}ms
            </div>
            <div className="text-primary-700 text-sm">
              {reactionTime < 300 ? 'Excellent!' : reactionTime < 500 ? 'Good!' : 'Too slow'}
            </div>
          </div>
        )}
      </button>

      <button
        onClick={onSkip}
        className="w-full rounded-full border border-error-300 bg-error-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-error-600"
      >
        Skip
      </button>
    </div>
  );
}

