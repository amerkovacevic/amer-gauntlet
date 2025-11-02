import { AuthProvider } from './contexts/AuthContext.jsx';
import { GauntletProvider } from './contexts/GauntletContext.jsx';
import { GauntletPlay } from './components/GauntletPlay.jsx';
import { Header } from './components/Header.jsx';

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-tertiary-500/20 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/3 translate-y-1/3 rounded-full bg-quaternary-500/20 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(65,90,119,0.12),_rgba(13,27,42,0.95))]" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GauntletProvider>
        <div className="relative min-h-screen bg-primary-800 text-accent-50">
          <Background />
          <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
            <Header />
            <GauntletPlay />
          </main>
          <footer className="border-t border-tertiary-500/30 bg-primary-800/80 py-4 text-center text-xs text-quaternary-500">
            <p>&copy; {new Date().getFullYear()} Amer Kovacevic All rights reserved.</p>
          </footer>
        </div>
      </GauntletProvider>
    </AuthProvider>
  );
}
