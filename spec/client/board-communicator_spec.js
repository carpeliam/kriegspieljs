import '../client_helper';
import {Client, Server} from 'mocket-io';
import BoardCommunicator from '../../client/board-communicator';

describe('BoardCommunicator', () => {
  var server = new Server();
  var client = new Client(server);
  var communicator;
  var socket;
  var noop = () => {};
  var onPlayerSitSpy = jasmine.createSpy('onPlayerSit');
  var onPlayerStandSpy = jasmine.createSpy('onPlayerStand');
  var onLogMessageSpy = jasmine.createSpy('onLogMessage');
  function newBoardCommunicator(props = {}) {
    var boardProps = {}
    boardProps.onBoardUpdate = (props.onBoardUpdate === undefined) ? noop : props.onBoardUpdate;
    boardProps.onRoomUpdate = (props.onRoomUpdate === undefined) ? noop : props.onRoomUpdate;
    boardProps.onRemoteMove = (props.onRemoteMove === undefined) ? noop : props.onRemoteMove;
    boardProps.onPlayerSit = (props.onPlayerSit === undefined) ? onPlayerSitSpy : props.onPlayerSit;
    boardProps.onPlayerStand = (props.onPlayerStand === undefined) ? onPlayerStandSpy : props.onPlayerStand;
    boardProps.onLogMessage = (props.onLogMessage === undefined) ? onLogMessageSpy : props.onLogMessage;
    return new BoardCommunicator(client, boardProps);
  }
  function establishConnection() {
    var otherSocket, otherClient;
    server.once('connection', (serverSocket) => { otherSocket = serverSocket; });
    otherClient = new Client(server).connect();
    return {otherSocket, otherClient};
  }
  beforeEach(() => {
    communicator = newBoardCommunicator();
    server.once('connection', (serverSocket) => { socket = serverSocket; });
  });

  it('expects valid onBoardUpdate', () => {
    expect(function() { newBoardCommunicator({onBoardUpdate: null}) }).toThrow(new Error('onBoardUpdate not defined'));
  });
  it('expects valid onRoomUpdate', () => {
    expect(function() { newBoardCommunicator({onRoomUpdate: null}) }).toThrow(new Error('onRoomUpdate not defined'));
  });
  it('expects valid onRemoteMove', () => {
    expect(function() { newBoardCommunicator({onRemoteMove: null}) }).toThrow(new Error('onRemoteMove not defined'));
  });
  it('expects valid onPlayerSit', () => {
    expect(function() { newBoardCommunicator({onPlayerSit: null}) }).toThrow(new Error('onPlayerSit not defined'));
  });
  it('expects valid onPlayerStand', () => {
    expect(function() { newBoardCommunicator({onPlayerStand: null}) }).toThrow(new Error('onPlayerStand not defined'));
  });
  it('expects valid onLogMessage', () => {
    expect(function() { newBoardCommunicator({onLogMessage: null}) }).toThrow(new Error('onLogMessage not defined'));
  });
  describe('when a user connects', () => {
    it('sends a connect message to the server', (done) => {
      server.once('connection', done);
      communicator.connectAs('jim');
    });
  });
  describe('when a user connects to a room', () => {
    beforeEach(() => {
      communicator.connectAs('jim');
    });
    it('sends the user name to the room', (done) => {
      socket.on('nickname.set', (name) => {
        expect(name).toEqual('jim');
        done();
      });
      socket.join('lobby');
      socket.emit('room.join', {});
    });
    it('calls the update state callback with the board');
  });

  describe('when a user chooses to sit', () => {
    beforeEach(() => {
      communicator.connectAs('Bobby');
      socket.emit('room.join', {});
    });
    it('allows the user to communicate this', (done) => {
      socket.on('sit', (color) => {
        expect(color).toEqual('white');
        done();
      });
      communicator.seat('Bobby', 'white');
    });
    describe('when another client has sat down', () => {
      beforeEach(() => {
        socket.emit('sit', 'white', {id: socket.id, name: 'Bobby'});
      });
      it('informs the client that a player has sat down', () => {
        expect(onPlayerSitSpy).toHaveBeenCalled();
      });
      it('sends a message to the room', () => {
        expect(onLogMessageSpy).toHaveBeenCalledWith({msg: 'Bobby sat down as white'});
      });
    });
  });

  describe('when a person is seated and chooses to stand', () => {
    beforeEach(() => {
      communicator.connectAs('Bobby');
      socket.emit('room.join', {});
      socket.emit('sit', 'white', {id: socket.id, name: 'Bobby'});
    });
    it('allows the user to communicate this', (done) => {
      socket.on('stand', done);
      communicator.stand();
    });
    describe('when another client has stood up', () => {
      beforeEach(() => {
        socket.emit('stand', 'white');
      });
      it('informs the client that a player has stood up', () => {
        expect(onPlayerStandSpy).toHaveBeenCalled();
      });
    });
  });

  describe('when a person sends a chat message', () => {
    beforeEach(() => {
      communicator.connectAs('Bobby');
      socket.emit('room.join', {});
    });
    it('sends messages to the room', (done) => {
      socket.on('speak', (msg) => {
        expect(msg).toEqual('Jolly good move, sir');
        done();
      })
      communicator.logMessage('Jolly good move, sir');
    });
    it('listens to messages from the room', () => {
      socket.emit('speak', 'Jolly good move, sir');
      expect(onLogMessageSpy).toHaveBeenCalledWith('Jolly good move, sir');
    });
  })

  describe('when a player makes a move', () => {
    it('raises an error if there is no current connection');
    it('broadcasts the move to the room if there is a connection');
  });

});
