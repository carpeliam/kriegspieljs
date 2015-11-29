export default class BoardCommunicator {
  constructor(io, args) {
    this.io = io;

    this.updateBoard = args.onBoardUpdate || (() => { throw new Error('onBoardUpdate not defined') })();
    this.updateRoomList = args.onRoomUpdate || (() => { throw new Error('onRoomUpdate not defined') })();
    this.processMove = args.onRemoteMove || (() => { throw new Error('onRemoteMove not defined') })();
    this.onPlayerSit = args.onPlayerSit || (() => { throw new Error('onPlayerSit not defined') })();
    this.onPlayerStand = args.onPlayerStand || (() => { throw new Error('onPlayerStand not defined') })();
    this.onLogMessage = args.onLogMessage || (() => { throw new Error('onLogMessage not defined') })();
  }
  connectAs(name) {
    this.socket = this.io.connect(location.origin);
    this.socket.on('room.join', ({white, black, board}) => {
      this.socket.emit('nickname.set', name);
      if (white) {
        this.onPlayerSit(white, 'white', white.id === this.socket.id);
      }
      if (black) {
        this.onPlayerSit(black, 'black', black.id === this.socket.id);
      }
      this.updateBoard(board);
      this._registerForRoomEvents();
    });
  }
  move(origCoords, newCoords, cb) {
    this.socket.emit('board.move', origCoords, newCoords, cb);
  }
  seat(player, color) {
    this.socket.emit('sit', color, (success) => {
      console.log(success);
    });
  }
  stand() {
    this.socket.emit('stand');
  }
  logMessage(msg) {
    this.socket.emit('speak', msg);
  }
  _registerForRoomEvents() {
    this.socket.on('room.list', this.updateRoomList);
    this.socket.on('board.move', this.processMove);
    this.socket.on('sit', (color, player) => {
      this.onLogMessage({msg: `${player.name} sat down as ${color}`});
      this.onPlayerSit(player, color, player.id === this.socket.id);
    });
    this.socket.on('stand', (color) => {
      this.onPlayerStand(color);
    });
    this.socket.on('speak', (msg) => {
      this.onLogMessage(msg);
    });
  }
}
