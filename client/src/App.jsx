import { useState, useEffect } from 'react';
import Home from './components/Home';
import Game from './components/Game';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinGameId = urlParams.get('join');
    
    if (joinGameId) {
      setGameData({ gameId: joinGameId });
      setCurrentView('game');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

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