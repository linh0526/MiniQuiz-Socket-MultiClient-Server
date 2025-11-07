const Game = require("../models/Game");

class GameService {
  constructor() {
    this.games = new Map();
  }

  generateRoomId() {
    // Tạo mã phòng random 6 số từ 1-9
    let roomId;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      roomId = '';
      for (let i = 0; i < 6; i++) {
        roomId += Math.floor(Math.random() * 9) + 1; // Số từ 1-9
      }
      attempts++;
    } while (this.games.has(roomId) && attempts < maxAttempts);
    
    // Nếu vẫn trùng sau maxAttempts lần, thêm timestamp
    if (this.games.has(roomId)) {
      roomId = roomId + Date.now().toString().slice(-4);
    }
    
    return roomId;
  }

  createGame(hostId) {
    const roomId = this.generateRoomId();
    const game = new Game(roomId, hostId);
    this.games.set(roomId, game);
    return game;
  }

  getGame(roomId) {
    return this.games.get(roomId);
  }

  deleteGame(roomId) {
    return this.games.delete(roomId);
  }

  joinGame(roomId, playerId, username) {
    const game = this.getGame(roomId);
    if (!game) return null;

    return game.addPlayer(playerId, username);
  }

  leaveGame(roomId, playerId) {
    const game = this.getGame(roomId);
    if (!game) return false;

    return game.removePlayer(playerId);
  }

  getAllGames() {
    return Array.from(this.games.values()).map((game) => game.getGameStats());
  }

  getActiveGamesCount() {
    return this.games.size;
  }

  getTotalPlayersCount() {
    let total = 0;
    this.games.forEach((game) => {
      total += game.players.size;
    });
    return total;
  }

  // Cleanup inactive games (older than 1 hour)
  cleanupInactiveGames() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const gamesToDelete = [];

    this.games.forEach((game, roomId) => {
      if (game.createdAt < oneHourAgo && game.players.size === 0) {
        gamesToDelete.push(roomId);
      }
    });

    gamesToDelete.forEach((roomId) => {
      this.games.delete(roomId);
    });

    return gamesToDelete.length;
  }
}

module.exports = new GameService();
