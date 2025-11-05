import { useState, useEffect } from 'react';

const COLORS = [
  { name: 'Blue', class: 'bg-tertiary-400' },
  { name: 'Purple', class: 'bg-quaternary-400' },
  { name: 'Green', class: 'bg-success-400' },
  { name: 'Orange', class: 'bg-warning-400' },
];

export function MemorySequence({ challenge, onPass, onFail, onSkip }) {
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [showSequence, setShowSequence] = useState(true);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    // Generate sequence of 4-5 colors
    const length = 4 + Math.floor(Math.random() * 2);
    const newSequence = Array.from({ length }, () => 
      COLORS[Math.floor(Math.random() * COLORS.length)]
    );
    setSequence(newSequence);
    setUserSequence([]);
    setShowSequence(true);
    setHighlightIndex(0);

    // Show sequence with highlights
    let currentIdx = 0;
    const highlightInterval = setInterval(() => {
      if (currentIdx < newSequence.length) {
        setHighlightIndex(currentIdx);
        currentIdx++;
      } else {
        clearInterval(highlightInterval);
        setShowSequence(false);
        setHighlightIndex(-1);
      }
    }, 600);
    
    return () => clearInterval(highlightInterval);
  }, [challenge.id]);

  const handleColorClick = (clickedColor) => {
    if (showSequence) return;

    const newUserSequence = [...userSequence, clickedColor];

    // Check if current color matches
    const expectedColor = sequence[userSequence.length];
    if (clickedColor.class !== expectedColor.class) {
      // Wrong color
      onFail();
      return;
    }

    setUserSequence(newUserSequence);

    // Check if complete
    if (newUserSequence.length === sequence.length) {
      onPass();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-accent-50 mb-2">Memory Sequence</h3>
        <p className="text-quaternary-300 text-sm mb-4">
          Watch the sequence, then repeat it!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {COLORS.map((color, index) => {
          const isHighlighted = showSequence && 
            highlightIndex >= 0 &&
            sequence[highlightIndex] && 
            sequence[highlightIndex].class === color.class;

          return (
            <button
              key={index}
              onClick={() => handleColorClick(color)}
              disabled={showSequence}
              className={`h-24 rounded-xl border-2 transition-all ${
                isHighlighted
                  ? `${color.class} border-accent-50 scale-110 shadow-lg`
                  : `${color.class} opacity-30`
              } ${
                showSequence ? 'cursor-not-allowed' : 'hover:scale-105 cursor-pointer hover:opacity-60'
              }`}
            >
              {isHighlighted && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/40 animate-pulse"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showSequence && (
        <p className="text-center text-quaternary-300 text-sm">
          Watch carefully... ({highlightIndex + 1}/{sequence.length})
        </p>
      )}
      {!showSequence && (
        <p className="text-center text-quaternary-300 text-sm">
          Now repeat the sequence ({userSequence.length}/{sequence.length})
        </p>
      )}

      <button
        onClick={onSkip}
        className="w-full rounded-full border border-warning-500/40 bg-warning-500/90 px-6 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white transition hover:bg-warning-500"
      >
        Skip
      </button>
    </div>
  );
}
