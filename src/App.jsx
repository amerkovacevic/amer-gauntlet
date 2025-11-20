import { AuthProvider } from './contexts/AuthContext.jsx';
import { GauntletProvider } from './contexts/GauntletContext.jsx';
import { Header } from './components/Header.jsx';
import { GauntletPlay } from './components/GauntletPlay.jsx';

export default function App() {
  return (
    <AuthProvider>
      <GauntletProvider>
        <div className="relative flex min-h-screen flex-col bg-accent-50 text-primary-900">
          <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 flex-1">
            <Header />
            <GauntletPlay />
          </main>
          <footer className="relative z-10 w-full border-t border-primary-200 bg-accent-100 py-4 text-center text-xs text-primary-600">
            <p>&copy; {new Date().getFullYear()} Amer Kovacevic All rights reserved.</p>
          </footer>
        </div>
      </GauntletProvider>
    </AuthProvider>
  );
}
