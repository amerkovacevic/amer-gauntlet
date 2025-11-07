import { AuthProvider } from './contexts/AuthContext.jsx';
import { GauntletProvider } from './contexts/GauntletContext.jsx';
import { Header } from './components/Header.jsx';
import { GauntletPlay } from './components/GauntletPlay.jsx';

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(65,90,119,0.12),_rgba(13,27,42,0.95))]" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GauntletProvider>
        <div className="relative flex min-h-screen flex-col bg-primary-800 text-accent-50">
          <Background />
          <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 flex-1">
            <Header />
            <GauntletPlay />
          </main>
          <footer className="relative z-10 w-full border-t border-tertiary-500/30 bg-primary-800/80 py-4 text-center text-xs text-quaternary-500">
            <p>&copy; {new Date().getFullYear()} Amer Kovacevic All rights reserved.</p>
          </footer>
        </div>
      </GauntletProvider>
    </AuthProvider>
  );
}
