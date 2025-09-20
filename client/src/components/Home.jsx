import { useState, useEffect } from 'react';
import { socket } from '../socket';

const Home = ({ onGameCreated, onGameJoined }) => {
  const [gameIdInput, setGameIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createGame = () => {
    setLoading(true);
    setError('');
    socket.emit('create-game');
  };

  const joinGame = () => {
    if (!gameIdInput.trim()) {
      setError('لطفا ID بازی را وارد کنید');
      return;
    }

    setLoading(true);
    setError('');
    socket.emit('join-game', { gameId: gameIdInput.trim() });
  };

  useEffect(() => {
    const handleGameCreated = (data) => {
      setLoading(false);
      onGameCreated(data);
    };

    const handlePlayerJoined = (data) => {
      setLoading(false);
      onGameJoined({ ...data, gameId: gameIdInput.trim() });
    };

    const handleError = (data) => {
      setLoading(false);
      setError(data.message);
    };

    socket.on('game-created', handleGameCreated);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('error', handleError);

    return () => {
      socket.off('game-created', handleGameCreated);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('error', handleError);
    };
  }, [gameIdInput, onGameCreated, onGameJoined]);

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 w-full max-w-md">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        بازی Tic-Tac-Toe
      </h1>
      
      <div className="mb-8">
        <button 
          onClick={createGame} 
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          {loading ? '⏳ در حال ایجاد...' : '🎮 ایجاد بازی جدید'}
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 text-center">پیوستن به بازی</h2>
        <input
          type="text"
          placeholder="ID بازی را وارد کنید"
          value={gameIdInput}
          onChange={(e) => setGameIdInput(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300"
        />
        <button 
          onClick={joinGame} 
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white py-3 px-6 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          {loading ? '⏳ در حال پیوستن...' : '🚀 پیوستن به بازی'}
        </button>
      </div>

      {error && (
        <div className="mt-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default Home;