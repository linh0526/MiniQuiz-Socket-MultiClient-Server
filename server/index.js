const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const GameController = require("./src/controllers/GameController");
const GameService = require("./src/services/GameService");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Khởi tạo game controller
new GameController(io);

// API routes
app.get("/api/games", (req, res) => {
  try {
    const games = GameService.getAllGames();
    res.json({
      success: true,
      data: games,
      stats: {
        activeGames: GameService.getActiveGamesCount(),
        totalPlayers: GameService.getTotalPlayersCount()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách game"
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server đang hoạt động",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Cleanup inactive games every 30 minutes
setInterval(() => {
  const cleaned = GameService.cleanupInactiveGames();
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} inactive games`);
  }
}, 30 * 60 * 1000);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Games API: http://localhost:${PORT}/api/games`);
});