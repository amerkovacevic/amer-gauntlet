/**
 * Create a seeded random number generator
 * Same seed = same sequence of random numbers
 */
export function createSeededRandom(seed) {
  let value = hashString(seed);
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/**
 * Hash a string to a number
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Pick random items from an array using seeded random
 */
export function pickFromArray(seededRandom, array, count) {
  const shuffled = [...array].sort(() => seededRandom() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}
