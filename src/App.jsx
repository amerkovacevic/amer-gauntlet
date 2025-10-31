import { AuthProvider } from './contexts/AuthContext.jsx';
import { GauntletProvider } from './contexts/GauntletContext.jsx';
import { GauntletPlay } from './components/GauntletPlay.jsx';
import { Header } from './components/Header.jsx';

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/3 translate-y-1/3 rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_rgba(15,23,42,0.95))]" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GauntletProvider>
        <div className="relative min-h-screen bg-slate-950 text-white">
          <Background />
          <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
            <Header />
            <GauntletPlay />
            <footer className="pb-12 text-center text-xs uppercase tracking-[0.3em] text-slate-500">
              Built for the daily grind. See you tomorrow.
            </footer>
          </main>
        </div>
      </GauntletProvider>
    </AuthProvider>
  );
}
