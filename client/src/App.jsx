import { useState, useEffect } from 'react';
import Home from './components/Home';
import Game from './components/Game';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [gameData, setGameData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinGameId = urlParams.get('join');
    
    if (joinGameId) {
      setGameData({ gameId: joinGameId });
      setCurrentView('game');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleGameCreated = (data) => {
    setGameData(data);
    setCurrentView('game');
  };

  const handleGameJoined = (data) => {
    setGameData(data);
    setCurrentView('game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {currentView === 'home' && (
        <Home 
          onGameCreated={handleGameCreated}
          onGameJoined={handleGameJoined}
        />
      )}
      {currentView === 'game' && gameData && (
        <Game 
          gameData={gameData}
          onLeaveGame={() => setCurrentView('home')}
        />
      )}
    </div>
  );
} 

export default App;