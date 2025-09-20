import { useState, useEffect } from 'react';
import Board from './Board';
import ShareGame from './ShareGame';
import { socket } from '../socket';

const Game = ({ gameData, onLeaveGame }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [yourSymbol, setYourSymbol] = useState('');
  const [gameStatus, setGameStatus] = useState('waiting');
  const [winner, setWinner] = useState(null);
  const [playersCount, setPlayersCount] = useState(1);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [showShare, setShowShare] = useState(true);
  const [winningLine, setWinningLine] = useState(null);

  useEffect(() => {
    if (gameData.symbol) {
      setYourSymbol(gameData.symbol);
    }

    const handleMoveMade = (data) => {
      setBoard(data.board);
      setIsYourTurn(data.turn === socket.id);
      setGameStatus(data.gameStatus);
      setWinningLine(data.winningLine);
      
      if (data.winner) {
        setWinner(data.winner);
        setShowShare(false);
      }
    };

    const handlePlayerJoined = (data) => {
      setPlayersCount(data.players);
      setIsYourTurn(data.turn === socket.id);
      setGameStatus('playing');
      setShowShare(false);
      setWinningLine(null);
      
      if (data.symbols && data.symbols[socket.id]) {
        setYourSymbol(data.symbols[socket.id]);
      }
    };

    const handleGameReset = (data) => {
      setBoard(data.board);
      setIsYourTurn(data.turn === socket.id);
      setGameStatus(data.status);
      setWinner(null);
      setOpponentLeft(false);
      setWinningLine(null);
      setShowShare(playersCount < 2);
    };

    const handleOpponentLeft = () => {
      setOpponentLeft(true);
      setGameStatus('paused');
      setShowShare(true);
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
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">اتاق بازی</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{gameData.gameId}</p>
        </div>
        {showShare && playersCount < 2 && (
          <ShareGame gameId={gameData.gameId} />
        )}
      </div>
      
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-slate-700 rounded-2xl">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">نماد شما:</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{yourSymbol}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600 dark:text-gray-300">بازیکنان:</span>
          <span className="text-lg font-semibold text-green-600 dark:text-green-400">{playersCount}/2</span>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl text-center">
        <p className={`text-lg font-semibold ${
          isYourTurn ? 'text-green-600 animate-pulse' : 
          winner ? 'text-red-600' : 
          'text-gray-700 dark:text-gray-300'
        }`}>
          {getStatusMessage()}
        </p>
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
        winningLine={winningLine}
      />

      {(winner || opponentLeft) && (
        <div className="flex gap-3 mt-8">
          <button 
            onClick={handlePlayAgain} 
            disabled={opponentLeft}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            🔄 بازی مجدد
          </button>
          <button 
            onClick={onLeaveGame}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            🚪 ترک بازی
          </button>
        </div>
      )}

      {gameStatus === 'waiting' && (
        <button 
          onClick={onLeaveGame}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-2xl font-semibold mt-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          ❌ لغو بازی
        </button>
      )}
    </div>
  );
};

export default Game;