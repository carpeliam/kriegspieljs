import '../client_helper';
// import io from 'socket.io-client';
// import EventEmitter from 'events';

// import fs from 'fs';

import {Client, Server} from 'mocket-io';

import BoardCommunicator from '../../client/board-communicator';


// debugger;
// fake server imports
// import socketIo from 'socket.io';
// import http from 'http';
// var utils = {
//   getServer: function (http) {
//     return require('../../game/socket-server')(http);
//   },

//   getClient: function () {
//     return require('socket.io-client')('http://localhost:3000', {
//       forceNew: true
//     });
//   }
// };

// function randStr() {
//   return Math.random().toString().slice(2);
// }

// // var rooms = {}

// function Room() {
//   var room = new EventEmitter;
//   var clients = [];
//   var roomEmit = room.emit;
//   room.emit = function() {
//     roomEmit.apply(room, arguments);
//     clients.forEach(function(client) {
//       client.emit.apply(client, arguments);
//     });
//   };
//   return room;
// }

// function Server() {
//   var svr = new EventEmitter;
//   svr._rooms = {};
//   svr.attach = function () {};
//   svr.listen = function () {};
//   svr.createClient = function() {
//     return new Client(svr);
//   }
//   // svr.connect = function(path) {};
//   svr.broadcast = {
//     to: function(roomName) {
//       return rooms[roomName];
//     }
//   }
//   svr._joinRoom = function(roomName, socket) {
//     svr._rooms[roomName] || (svr._rooms[roomName] = new Room());
//     svr._rooms[roomName].clients.push(socket);
//   };
//   return svr;
// }

// function Client(svr) {
//   var socket = new EventEmitter;
//   process.nextTick(function () {
//     svr.emit('connect', socket);
//     svr.emit('connection', socket);
//     socket.emit('connect');
//     socket.emit('connection');
//   });
//   socket.id = randStr();
//   socket.join = function(roomName) {
//     // socket.room = roomName;
//     svr._joinRoom(roomName, socket);
//   }
//   return socket;
// }

// var mockIo = {
//   Server: Server,
//   Client: Client
// }



describe('BoardCommunicator', () => {
  var server = new Server();
  var client = new Client(server);
  client.connect.connect = client.connect;
  var communicator;
  beforeEach(() => {
    communicator = new BoardCommunicator(client.connect);
  });

  describe('when a user connects', () => {
    it('sends a connect message to the server', (done) => {
      server.on('connection', done);
      communicator.connectAs('jim');
    });
  });
  describe('when a user connects to a room', () => {
    var socket;
    beforeEach((done) => {
      let clientConnected = false;
      let serverConnected = false;
      server.on('connection', (serverSocket) => {
        socket = serverSocket;
        clientConnected ? done() : serverConnected = true;
      });
      communicator.connectAs('jim');
      serverConnected ? done() : clientConnected = true;
    });
    it('sends the user name to the room', (done) => {
      socket.on('nickname.set', (name) => {
        expect(name).toEqual('jim');
        done();
      });
      socket.join('lobby');
      socket.emit('room.join');
    });
    it('calls the update state callback with the board');
  });

  describe('when a person chooses a color', () => {
    it('publishes a message to the room');
    it('allows the person to sit');
  });

  describe('when a player makes a move', () => {
    it('raises an error if there is no current connection');
    it('broadcasts the move to the room if there is a connection');
  });

});
