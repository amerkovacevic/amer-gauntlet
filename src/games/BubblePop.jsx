import { useState, useEffect, useRef } from 'react';

/**
 * BubblePop - Tap falling bubbles before they reach the bottom
 * Addictive arcade-style game with increasing difficulty
 */

function generateBubble(id, gameWidth, gameHeight) {
  return {
    id,
    x: Math.random() * (gameWidth - 60), // 60px bubble width
    y: -60,
    speed: 2 + Math.random() * 2,
    color: ['tertiary', 'success', 'warning', 'accent'][Math.floor(Math.random() * 4)],
    size: 50 + Math.random() * 20,
  };
}

export function BubblePop({ challenge, onPass, onFail, onSkip }) {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const bubbleIdRef = useRef(0);
  const spawnTimerRef = useRef(null);

  const GAME_WIDTH = 350;
  const GAME_HEIGHT = 450;
  const TARGET_SCORE = 20;
  const MAX_MISSES = 5;

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
    };
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setMissed(0);
    setBubbles([]);
    setGameOver(false);

    // Spawn bubbles periodically
    spawnTimerRef.current = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length < 8) {
          bubbleIdRef.current += 1;
          return [...prev, generateBubble(bubbleIdRef.current, GAME_WIDTH, GAME_HEIGHT)];
        }
        return prev;
      });
    }, 800);

    // Animation loop
    const animate = () => {
      setBubbles((prev) => {
        const updated = prev
          .map((bubble) => ({
            ...bubble,
            y: bubble.y + bubble.speed,
          }))
          .filter((bubble) => {
            if (bubble.y > GAME_HEIGHT) {
              setMissed((m) => m + 1);
              return false;
            }
            return true;
          });
        return updated;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (missed >= MAX_MISSES && gameStarted && !gameOver) {
      setGameOver(true);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setTimeout(() => onFail(), 1500);
    }
  }, [missed, gameStarted, gameOver, onFail]);

  useEffect(() => {
    if (score >= TARGET_SCORE && gameStarted && !gameOver) {
      setGameOver(true);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setTimeout(() => onPass(), 1500);
    }
  }, [score, gameStarted, gameOver, onPass]);

  const handleBubbleClick = (bubbleId) => {
    setBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
    setScore((s) => s + 1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-primary-900 mb-2">Bubble Pop</h3>
        <p className="text-primary-700 text-sm mb-4">
          Tap {TARGET_SCORE} bubbles before {MAX_MISSES} escape!
        </p>
      </div>

      {!gameStarted ? (
        <div className="bg-white border border-primary-200 rounded-2xl p-12 text-center space-y-6">
          <div className="text-6xl mb-4">🫧</div>
          <p className="text-primary-700 text-sm">
            Bubbles will fall from the top. Tap them before they reach the bottom!
          </p>
          <button
            onClick={startGame}
            className="w-full rounded-full border border-success-300 bg-success-500 px-6 py-4 text-lg font-bold uppercase tracking-[0.3em] text-white transition hover:bg-success-600"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center bg-white border border-primary-200 rounded-xl px-6 py-3">
            <div>
              <span className="text-xs text-primary-600 uppercase">Score</span>
              <div className="text-2xl font-bold text-success-700">{score}/{TARGET_SCORE}</div>
            </div>
            <div>
              <span className="text-xs text-primary-600 uppercase">Missed</span>
              <div className="text-2xl font-bold text-error-700">{missed}/{MAX_MISSES}</div>
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative bg-gradient-to-b from-accent-100 to-accent-200 rounded-2xl border-2 border-primary-300 overflow-hidden"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT, margin: '0 auto' }}
          >
            {bubbles.map((bubble) => (
              <button
                key={bubble.id}
                onClick={() => handleBubbleClick(bubble.id)}
                className={`absolute rounded-full transition-all duration-75 cursor-pointer border-2 ${
                  bubble.color === 'tertiary'
                    ? 'bg-tertiary-500/80 border-tertiary-400'
                    : bubble.color === 'success'
                    ? 'bg-success-500/80 border-success-400'
                    : bubble.color === 'warning'
                    ? 'bg-warning-500/80 border-warning-400'
                    : 'bg-accent-200/80 border-accent-100'
                } hover:scale-110 active:scale-95`}
                style={{
                  left: bubble.x,
                  top: bubble.y,
                  width: bubble.size,
                  height: bubble.size,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
                aria-label="Pop bubble"
              />
            ))}
            
            {gameOver && (
              <div className="absolute inset-0 bg-primary-900/90 flex items-center justify-center">
                <div className="text-center space-y-4">
                  {score >= TARGET_SCORE ? (
                    <>
                      <div className="text-6xl">🎉</div>
                      <div className="text-2xl font-bold text-success-400">Victory!</div>
                      <div className="text-accent-50">Score: {score}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl">💥</div>
                      <div className="text-2xl font-bold text-error-400">Too Many Missed!</div>
                      <div className="text-accent-50">Score: {score}/{TARGET_SCORE}</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
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

