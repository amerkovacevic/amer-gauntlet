import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { FirebaseProvider } from './contexts/FirebaseContext.jsx';
import { GameLibraryProvider } from './contexts/GameLibraryContext.jsx';
import { ScoreProvider } from './contexts/ScoreContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FirebaseProvider>
        <GameLibraryProvider>
          <ScoreProvider>
            <App />
          </ScoreProvider>
        </GameLibraryProvider>
      </FirebaseProvider>
    </BrowserRouter>
  </StrictMode>
);
