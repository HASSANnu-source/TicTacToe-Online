const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// ذخیره وضعیت بازی‌ها
const games = {};
const playerTimers = {};

// تابع تولید ID تصادفی برای بازی
function generateGameId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// تابع بررسی برنده
function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // ردیف‌ها
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // ستون‌ها
    [0, 4, 8], [2, 4, 6]             // قطرها
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        line: lines[i]
      };
    }
  }
  
  if (!board.includes(null)) {
    return {
      winner: 'draw',
      line: null
    };
  }
  
  return {
    winner: null,
    line: null
  };
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ایجاد بازی جدید
  socket.on('create-game', () => {
    const gameId = generateGameId();
    games[gameId] = {
      board: Array(9).fill(null),
      players: [socket.id],
      turn: socket.id,
      starter: socket.id,
      symbols: { [socket.id]: 'X' },
      status: 'waiting'
    };
    
    socket.join(gameId);
    socket.emit('game-created', { 
      gameId, 
      symbol: 'X',
      players: 1
    });
    
    console.log(`Game created: ${gameId} by ${socket.id}`);
  });

  // پیوستن به بازی موجود
  socket.on('join-game', (data) => {
    const { gameId } = data;
    const game = games[gameId];
    
    if (!game) {
      socket.emit('error', { message: 'بازی یافت نشد' });
      return;
    }
    
    if (game.players.length >= 2) {
      socket.emit('error', { message: 'بازی کامل است' });
      return;
    }
    
    // اضافه کردن بازیکن دوم
    game.players.push(socket.id);
    game.symbols[socket.id] = 'O';
    game.status = 'playing';
    socket.join(gameId);
    
    // شروع تایمر برای بازیکن اول
    startTimer(gameId, game.turn);
    
    // اطلاع به همه بازیکنان
    io.to(gameId).emit('player-joined', { 
      players: game.players.length,
      turn: game.turn,
      symbols: game.symbols
    });
    
    console.log(`Player ${socket.id} joined game: ${gameId}`);
  });

  // تابع شروع تایمر
  function startTimer(gameId, playerId) {
    // پاک کردن تایمر قبلی
    if (playerTimers[playerId]) {
      clearTimeout(playerTimers[playerId]);
      delete playerTimers[playerId];
    }
    
    playerTimers[playerId] = setTimeout(() => {
      const game = games[gameId];
      if (game && game.status === 'playing' && game.turn === playerId) {
        const opponentId = game.players.find(id => id !== playerId);
        if (opponentId) {
          game.winner = game.symbols[opponentId];
          game.status = 'finished';
          
          io.to(gameId).emit('game-ended', {
            winner: game.winner,
            reason: 'timeout'
          });
        }
      }
    }, 15000);
  }

  // تسلیم شدن در بازی
  socket.on('surrender', (data) => {
    const { gameId } = data;
    const game = games[gameId];
    
    if (!game) return;
    
    // پاک کردن تایمر
    if (playerTimers[game.turn]) {
      clearTimeout(playerTimers[game.turn]);
      delete playerTimers[game.turn];
    }
    
    const opponentId = game.players.find(id => id !== socket.id);
    if (opponentId) {
      game.winner = game.symbols[opponentId];
      game.status = 'finished';
      
      io.to(gameId).emit('game-ended', {
        winner: game.winner,
        reason: 'surrender'
      });
    }
  });

  // دریافت وضعیت بازی
  socket.on('get-game-status', (data) => {
    const { gameId } = data;
    const game = games[gameId];
    
    if (game) {
      socket.emit('game-status', {
        players: game.players.length,
        turn: game.turn,
        symbols: game.symbols,
        board: game.board,
        status: game.status
      });
    }
  });

  // مدیریت حرکت بازیکن
  socket.on('move', (data) => {
    const { gameId, cellIndex } = data;
    const game = games[gameId];
    
    if (!game || game.status !== 'playing') {
      socket.emit('error', { message: 'بازی آماده نیست' });
      return;
    }
    
    if (game.turn !== socket.id) {
      socket.emit('error', { message: 'نوبت شما نیست' });
      return;
    }
    
    if (game.board[cellIndex] !== null) {
      socket.emit('error', { message: 'این خانه پر است' });
      return;
    }
    
    // پاک کردن تایمر بازیکن فعلی
    if (playerTimers[game.turn]) {
      clearTimeout(playerTimers[game.turn]);
      delete playerTimers[game.turn];
    }
    
    const symbol = game.symbols[socket.id];
    game.board[cellIndex] = symbol;
    
    const currentPlayerIndex = game.players.indexOf(socket.id);
    const nextPlayerIndex = (currentPlayerIndex + 1) % 2;
    game.turn = game.players[nextPlayerIndex];
    
    // شروع تایمر برای بازیکن بعدی
    startTimer(gameId, game.turn);
    
    const result = checkWinner(game.board);
    const winner = result.winner;
    const winningLine = result.line;
    
    let gameStatus = 'playing';
    
    if (winner) {
      game.status = 'finished';
      gameStatus = 'finished';
      game.winner = winner;
      game.winningLine = winningLine;
      
      // پاک کردن تایمرها
      game.players.forEach(playerId => {
        if (playerTimers[playerId]) {
          clearTimeout(playerTimers[playerId]);
          delete playerTimers[playerId];
        }
      });
    }
    
    io.to(gameId).emit('move-made', {
      board: game.board,
      turn: game.turn,
      winner: winner,
      winningLine: winningLine,
      gameStatus: gameStatus,
      cellIndex: cellIndex,
      symbol: symbol
    });
  });

  // بازی مجدد
  socket.on('play-again', (data) => {
    const { gameId } = data;
    const game = games[gameId];
    
    if (game && game.players.length === 2) {
      // پاک کردن تایمرهای قبلی
      game.players.forEach(playerId => {
        if (playerTimers[playerId]) {
          clearTimeout(playerTimers[playerId]);
          delete playerTimers[playerId];
        }
      });
      
      game.starter = game.starter === game.players[0] ? game.players[1] : game.players[0];
      game.turn = game.starter;
      
      game.board = Array(9).fill(null);
      game.status = 'playing';
      delete game.winner;
      delete game.winningLine;
      
      // شروع تایمر برای بازیکن شروع‌کننده
      startTimer(gameId, game.turn);
      
      io.to(gameId).emit('game-reset', {
        board: game.board,
        turn: game.turn,
        status: 'playing'
      });
    }
  });

  // وقتی کاربر قطع می‌شود
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // پاک کردن تایمر کاربر
    if (playerTimers[socket.id]) {
      clearTimeout(playerTimers[socket.id]);
      delete playerTimers[socket.id];
    }
    
    for (const gameId in games) {
      const game = games[gameId];
      const playerIndex = game.players.indexOf(socket.id);
      
      if (playerIndex !== -1) {
        const opponentId = game.players.find(id => id !== socket.id);
        if (opponentId) {
          io.to(opponentId).emit('opponent-left');
        }
        
        if (game.players.length === 1) {
          delete games[gameId];
        } else {
          game.players.splice(playerIndex, 1);
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});