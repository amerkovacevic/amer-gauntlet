import {
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit as limitResults,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

const DAILY_COLLECTION = ['leaderboards', 'daily', 'scores'];
const MONTHLY_COLLECTION = ['leaderboards', 'monthly', 'scores'];
const ALL_TIME_COLLECTION = ['leaderboards', 'allTime', 'scores'];

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getMonthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function logScoreEntry(db, { userId, displayName, total, breakdown, secondsElapsed, correct, skipped }) {
  const now = new Date();
  const dailyKey = getDateKey(now);
  const monthKey = getMonthKey(now);

  const payload = {
    userId,
    displayName,
    total,
    breakdown,
    secondsElapsed,
    correct,
    skipped,
    createdAt: serverTimestamp(),
  };

  await Promise.all([
    addDoc(collection(db, ...DAILY_COLLECTION), { ...payload, bucket: dailyKey }),
    addDoc(collection(db, ...MONTHLY_COLLECTION), { ...payload, bucket: monthKey }),
    addDoc(collection(db, ...ALL_TIME_COLLECTION), payload),
  ]);
}

export async function fetchLeaderboard(db, type, bucketValue, limit = 10) {
  let path;
  let queryConstraints = [];

  switch (type) {
    case 'daily':
      path = DAILY_COLLECTION;
      queryConstraints = [where('bucket', '==', bucketValue ?? getDateKey())];
      break;
    case 'monthly':
      path = MONTHLY_COLLECTION;
      queryConstraints = [where('bucket', '==', bucketValue ?? getMonthKey())];
      break;
    case 'allTime':
      path = ALL_TIME_COLLECTION;
      break;
    default:
      throw new Error(`Unknown leaderboard type: ${type}`);
  }

  const leaderboardQuery = query(
    collection(db, ...path),
    ...queryConstraints,
    orderBy('total', 'desc'),
    limitResults(limit)
  );

  const snapshot = await getDocs(leaderboardQuery);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
