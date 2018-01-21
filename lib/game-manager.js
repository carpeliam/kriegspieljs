const Game = require('./game');
const parseCookie = require('cookie').parse;

function clientFor(socket, name) {
  const kriegspielUser = parseCookie(socket.handshake.headers.cookie)['kriegspiel.user'];
  const { id } = JSON.parse(kriegspielUser);
  return { id, name };
}

module.exports = function GameManager(server) {
  const clients = {};
  const players = {};
  let game = new Game();

  function standIfSeated(client) {
    const color = ['white', 'black'].find(c => players[c] === client);
    if (color) {
      delete players[color];
      server.emit('stand', color);
      if (!players.white && !players.black) {
        game = new Game();
        server.emit('game.reset', { board: game });
      }
    }
  }

  server.on('connection', (socket) => {
    socket.emit('board.update', { board: game });
    socket.on('nickname.set', (nickname) => {
      clients[socket.id] = clientFor(socket, nickname);
      server.emit('room.list', Object.values(clients));
      ['white', 'black'].forEach(c => players[c] && socket.emit('sit', c, players[c]));
    });
    socket.on('sit', (color) => {
      const sittingPlayer = clients[socket.id];
      players[color] = sittingPlayer;
      server.emit('sit', color, sittingPlayer);
    });
    socket.on('stand', () => {
      standIfSeated(clients[socket.id]);
    });
    socket.on('resign', () => {
      const client = clients[socket.id];
      const color = ['white', 'black'].find(c => players[c] === client);
      game.inProgress = false;
      server.emit('game.resign', color, game);
    });
    socket.on('board.move', (from, to) => {
      game.move(from.x, from.y, to.x, to.y);
      server.emit('board.move', from, to);
    });
    socket.on('board.promote', (coord, newPieceType) => {
      if (game.promote(coord, newPieceType)) {
        server.emit('board.promote', coord, newPieceType);
      }
    });
    socket.on('speak', (msg) => {
      const client = clients[socket.id];
      server.emit('speak', client, msg);
    });
    socket.on('disconnect', () => {
      standIfSeated(clients[socket.id]);
      delete clients[socket.id];
      server.emit('room.list', Object.values(clients));
    });
  });
}
