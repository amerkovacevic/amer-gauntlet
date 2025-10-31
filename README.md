# Daily Five Challenge

A Tailwind-powered React experience for a daily gauntlet of five bite-sized games. Players sign in
with Firebase Authentication, race through the games, and land on daily, monthly, and all-time
leaderboards backed by Cloud Firestore.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Firebase by creating a `.env.local` file in the project root:

   ```bash
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Game integration

The daily challenge pulls five games from the library defined in
`src/contexts/GameLibraryContext.jsx`. Each game entry exposes a React component that receives three
callback props:

- `onCorrect()` – Call when the player answers correctly.
- `onSkip()` – Call when the player skips a prompt.
- `onComplete()` – Call when the mini-game is finished to move to the next challenge.

Replace the placeholder components with your actual mini-games. The score system—found in
`src/contexts/ScoreContext.jsx`—tracks correctness, skips, and elapsed time to compute the final
score. Once the fifth game reports completion, the score is automatically saved to the daily,
monthly, and all-time leaderboards stored in Firestore.

## Leaderboards

Leaderboard utilities live in `src/utils/leaderboard.js`. The structure uses the following
collections:

- `leaderboards/daily/scores` (filtered by the ISO day string)
- `leaderboards/monthly/scores` (filtered by the `YYYY-MM` key)
- `leaderboards/allTime/scores`

Each entry stores the total score, a breakdown, time elapsed, correctness metrics, and a server
timestamp. Adjust Firestore security rules to allow authenticated users to create new score
documents.
