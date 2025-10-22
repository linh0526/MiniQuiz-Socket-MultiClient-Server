const Game = require('../models/Game');

class GameService {
  constructor() {
    this.games = new Map();
    this.roomCounter = 1;
  }

  createGame(hostId) {
    const roomId = `room_${this.roomCounter++}`;
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
    return Array.from(this.games.values()).map(game => game.getGameStats());
  }

  getActiveGamesCount() {
    return this.games.size;
  }

  getTotalPlayersCount() {
    let total = 0;
    this.games.forEach(game => {
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
    
    gamesToDelete.forEach(roomId => {
      this.games.delete(roomId);
    });
    
    return gamesToDelete.length;
  }
}

module.exports = new GameService();
