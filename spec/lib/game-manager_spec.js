const io = require('socket.io-client');
const GameManager = require('../../lib/game-manager');
const Game = require('../../lib/game');

describe('GameManager', () => {
  let server;
  beforeEach(done => server = new Server(done));
  afterEach(done => server.close(done));
  it('tells other clients when a client has set their nickname', (done) => {
    server.connect().then((client1) => {
      client1.withName('Bobby');
      server.connect().then((client2) => {
        client2.withName('Gary');
        client1.on('room.list', (roomList) => {
          expect(roomList).toEqual([client1.json(), client2.json()]);
          done();
        });
      });
    });
  });
  describe('sitting', () => {
    let client;
    beforeEach((done) => {
      server.connect().then((newClient) => {
        client = newClient;
        client.withName('Bobby');
        done();
      });
    });
    it('alerts all clients that the user has sat down', (done) => {
      client.on('sit', (color, sittingClient) => {
        expect(color).toEqual('white');
        expect(sittingClient).toEqual(client.json());
        done();
      });
      client.emit('sit', 'white');
    });
  });
  describe('standing', () => {
    let client;
    beforeEach((done) => {
      server.connect().then((newClient) => {
        client = newClient;
        client.withName('Bobby');
        client.emit('sit', 'white');
        done();
      });
    });
    it('makes the standing players seat absent and informs all clients', (done) => {
      client.on('stand', (color) => {
        expect(color).toEqual('white');
        done();
      });
      client.emit('stand');
    });
  });
  describe('with two seated players', () => {
    let white;
    let black;
    beforeEach((done) => {
      server.connect().then((client) => {
        white = client;
        white.withName('Bobby');
        white.emit('sit', 'white');
        server.connect().then((client) => {
          black = client;
          black.withName('Gary');
          const roomHasTwoMembers = new Promise((resolve) => {
            white.on('room.list', (roomList) => {
              if (roomList.length === 2) {
                resolve();
              }
            });
          });
          const blackHasSat = new Promise((resolve) => {
            white.on('sit', (color) => {
              if (color === 'black') {
                resolve();
              }
            });
          });
          black.emit('sit', 'black');
          Promise.all([roomHasTwoMembers, blackHasSat]).then(done);
        });
      });
    });
    it('forwards resignations to other users', (done) => {
      black.on('board.move', () => {
        black.on('game.resign', (color, board) => {
          expect(color).toEqual('white');
          expect(board.inProgress).toBeFalsy();
          done();
        });
        white.emit('resign');
      });
      white.emit('board.move', { x: 0, y: 1 }, { x: 0, y: 2 });
    });
    it('resets the game if both players stand', (done) => {
      white.on('game.reset', ({ board }) => {
        const emptyGame = new Game();
        expect(new Game({ gameState: board }).gameState()).toEqual(emptyGame.gameState());
        done();
      });
      white.emit('stand');
      black.emit('stand');
    });
    describe('when a new client connects', () => {
      it('immediately informs them of the game state', (done) => {
        black.on('board.move', () => {
          const recreatedGame = new Game();
          recreatedGame.move(5, 1, 5, 3);
          server.connect().then(({ board }) => {
            expect(new Game({ gameState: board }).gameState()).toEqual(recreatedGame.gameState());
            done();
          });
        });
        white.emit('board.move', { x: 5, y: 1 }, { x: 5, y: 3 });
      });
      it('informs them of seated players', (done) => {
        server.connect().then((client) => {
          const calls = [];
          client.on('sit', (color, sittingClient) => {
            calls.push({ color, sittingClient });
            if (calls.length < 2) { return; }
            expect(calls).toContain({ color: 'white', sittingClient: white.json() });
            expect(calls).toContain({ color: 'black', sittingClient: black.json() });
            done();
          });
          client.withName('Jim');
        });
      });
    });
    describe('moving', () => {
      it('reports moves to all users', (done) => {
        black.on('board.move', (from, to) => {
          expect(from).toEqual({ x: 0, y: 1 });
          expect(to).toEqual({ x: 0, y: 2 });
          done();
        });
        white.emit('board.move', { x: 0, y: 1 }, { x: 0, y: 2 });
      });
    });
    describe('promotion', () => {
      it('alerts other clients when one client promotes a piece', (done) => {
        spyOn(Game.prototype, 'promote').and.returnValue(true);
        black.on('board.promote', (coord, newPieceType) => {
          expect(coord).toEqual({ x: 0, y: 0 });
          expect(newPieceType).toEqual(5);
          expect(Game.prototype.promote).toHaveBeenCalledWith({ x: 0, y: 0 }, 5);
          done();
        });
        white.emit('board.promote', { x: 0, y: 0 }, 5);
      });
    });
    describe('speaking', () => {
      it('forwards chat messages to other clients', (done) => {
        black.on('speak', (author, msg) => {
          expect(author).toEqual(white.json());
          expect(msg).toEqual('prepare to be mated!');
          done();
        });
        white.emit('speak', 'prepare to be mated!');
      });
    });
    describe('disconnecting', () => {
      it('sends an updated room.list to other clients', (done) => {
        white.on('room.list', (roomList) => {
          expect(roomList).toEqual([white.json()]);
          done();
        });
        black.disconnect();
      });
      it('forces a sitting player to stand', (done) => {
        white.on('stand', (color) => {
          expect(color).toEqual('black');
          done();
        });
        black.disconnect();
      });
    });
  });
});

class Client {
  constructor(ioClient, board1, id) {
    this.ioClient = ioClient;
    this.board = board1;
    this.id = id;
  }
  on(...args) { this.ioClient.on(...args); }
  emit(...args) { this.ioClient.emit(...args); }
  disconnect() { this.ioClient.disconnect(); }

  withName(nickname) {
    this.nickname = nickname;
    this.ioClient.emit('nickname.set', this.nickname);
  }

  json() { return { id: this.id, name: this.nickname }; }
}

class Server {
  constructor(done) {
    this.openConnections = 0;
    this.httpServer = require('http').createServer();
    this.ioServer = require('socket.io')(this.httpServer);
    this.ioServer.on('connection', (serverSocket) => {
      const cookieId = `abc${++this.openConnections}`;
      serverSocket.handshake = {
        headers: {
          cookie: `connect.sid=${cookieId}; kriegspiel.user=${JSON.stringify({
            id: cookieId
          })}`
        }
      };
    });
    this.httpServer.listen(() => {
      this.mgr = GameManager(this.ioServer);
      this.url = `http://localhost:${(this.httpServer.address().port)}`;
      done();
    });
  }

  connect(existingId) {
    const client = io.connect(this.url, { transports: ['websocket'], forceNew: true });
    return new Promise((resolve, reject) => {
      client.on('connect', () => {
        client.once('board.update', ({ board }) => {
          resolve(new Client(client, board, `abc${this.openConnections}`));
        });
      });
    });
  }

  close(done) {
    this.ioServer.close(() => this.httpServer.close(() => done()));
  }
}
