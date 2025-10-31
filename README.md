# Amer Gauntlet

Amer Gauntlet is a React + Tailwind web app that delivers a Wordle-style daily challenge made of five mini games. Each day, everyone receives the same set of five quick puzzles pulled from a vault of twenty. Scores reward speed and correct answers, penalize skips and fails, and power daily, weekly, and all-time leaderboards backed by Firebase Authentication and Cloud Firestore.

https://github.com/amergauntlet

## Features

- 🎲 Daily gauntlet of five mini games selected deterministically from a library of twenty challenges
- ⏱️ Score calculation that rewards passes, penalizes skips and fails, and factors in total time
- 🔐 Google authentication with streak tracking and profile storage
- 🏆 Daily, weekly, and all-time leaderboards sourced from Firestore
- 💾 Local persistence so you can resume today’s gauntlet if you refresh mid-run

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Firebase by creating a `.env.local` file in the project root. Make sure the credentials match a Firebase project with Authentication (Google provider) and Firestore enabled.

   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

   Vite will print a local development URL. Open it in your browser to play the daily gauntlet.

## Architecture overview

- **Mini games** live in [`src/miniGames/index.jsx`](src/miniGames/index.jsx). Each definition provides metadata, a deterministic challenge generator, and a React component that renders the puzzle UI. The library currently includes twenty lightweight puzzles (math drills, sequence games, color matching, and word-based trivia). Daily selection uses a seeded random generator so everyone sees the same set.
- **State management** is handled by the [`GauntletContext`](src/contexts/GauntletContext.jsx), which tracks the player’s progress, timing, and completion state and persists it to `localStorage` for the current day.
- **Authentication** is provided by [`AuthContext`](src/contexts/AuthContext.jsx), wrapping Firebase Auth with Google sign-in.
- **Scoring** rules are defined in [`src/utils/scoring.js`](src/utils/scoring.js). Final scores combine completed games, penalties, and elapsed seconds.
- **Firestore sync** happens inside [`GauntletPlay`](src/components/GauntletPlay.jsx). When a signed-in player finishes the gauntlet, their result posts to `dailyGauntlets/{date}/results/{uid}` and the global `runs` collection, and their streak is updated in `users/{uid}`.

## Firestore data layout

```
dailyGauntlets/{date}/results/{uid}
  displayName
  score
  passes
  skips
  fails
  totalTime
  completedAt
  weekId

runs/{runId}
  uid
  displayName
  date
  weekId
  score
  passes
  skips
  fails
  totalTime
  completedAt

users/{uid}
  displayName
  streak
  lastCompleted
  bestScore
  createdAt
  updatedAt
```

You may need to create Firestore composite indexes for the leaderboard queries (`score` descending with filters on `weekId`). Deploy the security rules in [`firestore.rules`](firestore.rules) to enforce leaderboard writes from authenticated players only.

## Styling

The interface mirrors the glassmorphism look of the Pickup Soccer and FM Team Draw projects—soft gradients, frosted cards, and electric blue highlights. Tailwind CSS powers all styling so you can quickly tweak the visual identity.

## Deployment

Build a production bundle with:

```bash
npm run build
```

Deploy the generated `dist/` folder to your hosting provider. If you use Firebase Hosting, copy the Firebase configuration values into `.env.production` and run `firebase deploy`.
