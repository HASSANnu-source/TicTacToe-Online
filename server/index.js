const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// ذخیره وضعیت بازی‌ها
const games = {};

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
        line: lines[i] // اضافه کردن خط برنده
      };
    }
  }
  
  // بررسی مساوی
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
    
    // اطلاع به همه بازیکنان
    io.to(gameId).emit('player-joined', { 
      players: game.players.length,
      turn: game.turn,
      symbols: game.symbols
    });
    
    console.log(`Player ${socket.id} joined game: ${gameId}`);
  });

  // مدیریت حرکت بازیکن
  socket.on('move', (data) => {
    const { gameId, cellIndex } = data;
    const game = games[gameId];
    
    if (!game || game.status !== 'playing') {
      socket.emit('error', { message: 'بازی آماده نیست' });
      return;
    }
    
    // بررسی آیا نوبت این بازیکن است
    if (game.turn !== socket.id) {
      socket.emit('error', { message: 'نوبت شما نیست' });
      return;
    }
    
    // بررسی آیا خانه خالی است
    if (game.board[cellIndex] !== null) {
      socket.emit('error', { message: 'این خانه پر است' });
      return;
    }
    
    // ثبت حرکت
    const symbol = game.symbols[socket.id];
    game.board[cellIndex] = symbol;
    
    // تغییر نوبت به بازیکن بعدی
    const currentPlayerIndex = game.players.indexOf(socket.id);
    const nextPlayerIndex = (currentPlayerIndex + 1) % 2;
    game.turn = game.players[nextPlayerIndex];
    
    // بررسی برنده
    const result = checkWinner(game.board);
    const winner = result.winner;
    const winningLine = result.line;
    
    let gameStatus = 'playing';
    
    if (winner) {
      game.status = 'finished';
      gameStatus = 'finished';
      game.winner = winner;
      game.winningLine = winningLine; // ذخیره خط برنده
    }
    
    // ارسال به همه بازیکنان
    io.to(gameId).emit('move-made', {
      board: game.board,
      turn: game.turn,
      winner: winner,
      winningLine: winningLine, // ارسال خط برنده
      gameStatus: gameStatus,
      cellIndex: cellIndex,
      symbol: symbol
    });
    console.log(`Move made in game ${gameId} by ${socket.id}`);
  });

  // بازی مجدد
  socket.on('play-again', (data) => {
    const { gameId } = data;
    const game = games[gameId];
    
    if (game && game.players.length === 2) {
      // reset game state
      game.board = Array(9).fill(null);
      game.turn = game.players[0]; // بازیکن اول شروع کند
      game.status = 'playing';
      delete game.winner;
      
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
    
    // پیدا کردن بازی‌هایی که این کاربر در آن بود
    for (const gameId in games) {
      const game = games[gameId];
      const playerIndex = game.players.indexOf(socket.id);
      
      if (playerIndex !== -1) {
        // اطلاع به بازیکن مقابل
        const opponentId = game.players.find(id => id !== socket.id);
        if (opponentId) {
          io.to(opponentId).emit('opponent-left');
        }
        
        // حذف بازی اگر یک بازیکن باقی مانده
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