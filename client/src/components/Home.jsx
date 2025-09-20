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

  // گوش دادن به eventهای socket
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
    <div>
      <h1>بازی Tic-Tac-Toe چندنفره</h1>
      
      <div>
        <h2>ایجاد بازی جدید</h2>
        <button onClick={createGame} disabled={loading}>
          {loading ? 'در حال ایجاد...' : 'ایجاد بازی جدید'}
        </button>
      </div>

      <div>
        <h2>پیوستن به بازی</h2>
        <input
          type="text"
          placeholder="ID بازی را وارد کنید"
          value={gameIdInput}
          onChange={(e) => setGameIdInput(e.target.value)}
          disabled={loading}
        />
        <button onClick={joinGame} disabled={loading}>
          {loading ? 'در حال پیوستن...' : 'پیوستن به بازی'}
        </button>
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default Home;