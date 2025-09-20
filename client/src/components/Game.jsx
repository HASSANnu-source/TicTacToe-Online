import { useState, useEffect } from 'react';
import Board from './Board';
import ShareGame from './ShareGame';
import { socket } from '../socket';

const Game = ({ gameData, onLeaveGame }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [yourSymbol, setYourSymbol] = useState('');
  const [gameStatus, setGameStatus] = useState('waiting');
  const [winner, setWinner] = useState(null);
  const [playersCount, setPlayersCount] = useState(1);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [showShare, setShowShare] = useState(true);

  useEffect(() => {
    // تنظیم symbol کاربر
    if (gameData.symbol) {
      setYourSymbol(gameData.symbol);
    }

    // گوش دادن به eventهای socket
    const handleMoveMade = (data) => {
      setBoard(data.board);
      setCurrentTurn(data.turn);
      setIsYourTurn(data.turn === socket.id);
      setGameStatus(data.gameStatus);
      
      if (data.winner) {
        setWinner(data.winner);
        setShowShare(false); // مخفی کردن لینک اشتراک بعد از پایان بازی
      }
    };

    const handlePlayerJoined = (data) => {
      setPlayersCount(data.players);
      setCurrentTurn(data.turn);
      setIsYourTurn(data.turn === socket.id);
      setGameStatus('playing');
      setShowShare(false); // مخفی کردن لینک اشتراک بعد از پیوستن بازیکن دوم
      
      // تنظیم symbol کاربر
      if (data.symbols && data.symbols[socket.id]) {
        setYourSymbol(data.symbols[socket.id]);
      }
    };

    const handleGameReset = (data) => {
      setBoard(data.board);
      setCurrentTurn(data.turn);
      setIsYourTurn(data.turn === socket.id);
      setGameStatus(data.status);
      setWinner(null);
      setOpponentLeft(false);
      setShowShare(playersCount < 2); // نمایش لینک اگر بازیکن دوم نیامده
    };

    const handleOpponentLeft = () => {
      setOpponentLeft(true);
      setGameStatus('paused');
      setShowShare(true); // نمایش مجدد لینک اگر حریف رفت
    };

    const handleError = (data) => {
      alert(data.message);
    };

    socket.on('move-made', handleMoveMade);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('game-reset', handleGameReset);
    socket.on('opponent-left', handleOpponentLeft);
    socket.on('error', handleError);

    return () => {
      socket.off('move-made', handleMoveMade);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('game-reset', handleGameReset);
      socket.off('opponent-left', handleOpponentLeft);
      socket.off('error', handleError);
    };
  }, [gameData, playersCount]);

  const handlePlayAgain = () => {
    socket.emit('play-again', { gameId: gameData.gameId });
  };

  const getStatusMessage = () => {
    if (opponentLeft) return 'حریف بازی را ترک کرد';
    if (gameStatus === 'waiting') return 'در انتظار بازیکن دوم...';
    if (winner === 'draw') return 'بازی مساوی شد!';
    if (winner) return `بازیکن ${winner} برنده شد!`;
    if (isYourTurn) return 'نوبت شماست!';
    return 'نوبت حریف...';
  };

  return (
    <div>
      <div style={{display: "flex", alignItems: 'center', gap: '20px'}}>
        <h2>اتاق بازی: {gameData.gameId}</h2>
        {/* نمایش لینک اشتراک وقتی بازی در انتظار بازیکن دوم است */}
        {showShare && playersCount < 2 && (
          <ShareGame gameId={gameData.gameId} />
        )}
      </div>
      <p>نماد شما: {yourSymbol}</p>
      <p>تعداد بازیکنان: {playersCount}/2</p>
      
      <div>
        <p>{getStatusMessage()}</p>
      </div>

      <Board 
        board={board}
        onCellClick={(index) => {
          if (isYourTurn && gameStatus === 'playing' && !board[index]) {
            socket.emit('move', {
              gameId: gameData.gameId,
              cellIndex: index
            });
          }
        }}
        disabled={!isYourTurn || gameStatus !== 'playing'}
      />

      {(winner || opponentLeft) && (
        <div style={{ marginTop: '20px' }}>
          <button onClick={handlePlayAgain} disabled={opponentLeft}>
            بازی مجدد
          </button>
          <button onClick={onLeaveGame} style={{ marginLeft: '10px' }}>
            ترک بازی
          </button>
        </div>
      )}

      {gameStatus === 'waiting' && (
        <button onClick={onLeaveGame} style={{ marginTop: '20px' }}>
          لغو بازی
        </button>
      )}
    </div>
  );
};

export default Game;