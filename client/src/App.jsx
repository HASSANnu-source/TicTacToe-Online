import { useState, useEffect } from 'react';
import Home from './components/Home';
import Game from './components/Game';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    // بررسی پارامترهای URL برای پیوستن مستقیم
    const urlParams = new URLSearchParams(window.location.search);
    const joinGameId = urlParams.get('join');
    
    if (joinGameId) {
      // اگر لینک حاوی ID بازی باشد، مستقیماً به صفحه بازی برو
      setGameData({ gameId: joinGameId });
      setCurrentView('game');
      
      // پاک کردن پارامتر از URL بدون ریلود صفحه
      window.history.replaceState({}, document.title, window.location.pathname);
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
    <div className="App">
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