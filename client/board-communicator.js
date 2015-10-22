export default class BoardCommunicator {
  constructor(io, args) {
    this.io = io;

    this.updateBoard = args.onBoardUpdate || (() => { throw new Error('onBoardUpdate not defined') })();
    this.updateRoomList = args.onRoomUpdate || (() => { throw new Error('onRoomUpdate not defined') })();
    this.processMove = args.onRemoteMove || (() => { throw new Error('onRemoteMove not defined') })();
    this.onPlayerSit = args.onPlayerSit || (() => { throw new Error('onPlayerSit not defined') })();
  }
  connectAs(name) {
    this.socket = this.io.connect(location.origin);
    this.socket.on('room.join', (room, board) => {
      console.log('room.join', room, board);
      this.room = this.io.connect(location.origin + room);
      this.room.emit('nickname.set', name);
      this.updateBoard(board);
      this._registerForRoomEvents();
    });
  }
  move(origCoords, newCoords, cb) {
    console.log('move attempt');
    this.room.emit('board.move', origCoords, newCoords, cb);
  }
  seat(player, color) {
    this.room.emit('sit', color, player);
  }
  _registerForRoomEvents() {
    this.room.on('room.list', this.updateRoomList);
    this.room.on('board.move', this.processMove);
    this.room.on('sit', (color, player) => {
      this._publishMessage(player.nickname + ' sat down as ' + color, 'notice');
      this.onPlayerSit(player, color, player.id == this.socket.id);
    });
  }
  _publishMessage(msg, level) {

  }
}
