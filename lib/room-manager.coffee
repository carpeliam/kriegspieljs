Board = require('./board')
parseCookie = require('cookie').parse

getID = (client) ->
  parseCookie(client.handshake.headers.cookie)['connect.sid']

oppositeColor = (color) -> if color is 'white' then 'black' else 'white'

roomFor = (socket) ->
  for room in socket.rooms
    return room unless room is socket.id

module.exports = class RoomManager
  constructor: (@server) ->
    @clients = {}
    @rooms = {}
    @server.on 'connection', (socket) =>
      socket.join 'Lobby'

      socket.on 'nickname.set', (nickname) =>
        @clients[getID(socket)] = nickname
        room = roomFor(socket)
        # socket.broadcast.to(room).emit 'room.list', @namesIn(room)
        socket.emit 'room.list', @namesIn(room)

      socket.on 'sit', (color, cb) =>
        client = @clients[getID(socket)]
        room = @getRoomByName(roomFor(socket))
        if !room[color]? and client? and room[oppositeColor(color)] isnt client
          room[color] = client
          cb?(true)
          socket.emit 'sit', color, client
        else
          cb?(false)

      socket.on 'stand', (cb) =>
        client = @clients[getID(socket)]
        room = @getRoomByName(roomFor(socket))
        if room.white? and room.black?
          cb?(false)
        else
          color = ['white', 'black'].find (c) -> room[c] is client
          if color?
            room[color] = undefined
            cb?(true)
            socket.emit 'stand', color
          else
            cb?(false)

      socket.on 'board.move', (from, to, cb) =>
        client = @clients[getID(socket)]
        room = @getRoomByName(roomFor(socket))
        board = room.board
        color = if board.turn is 1 then 'white' else 'black'
        if room[color] is client and board.move(from.x, from.y, to.x, to.y)
          cb?(true)
          socket.emit 'board.move', from, to
        else
          cb?(false)

      socket.on 'board.promote', ({x, y}, newPieceType, cb) =>
        client = @clients[getID(socket)]
        room = @getRoomByName(roomFor(socket))
        board = room.board
        if board.promote {x, y}, newPieceType
          cb?(true)
          socket.emit 'board.promote', {x, y}, newPieceType
        else
          cb?(false)

  namesIn: (room) ->
    names = []
    for socket in @server.sockets
      if room in socket.rooms
        socketNickname = @clients[getID(socket)]
        names.push socketNickname
    return names

  getRoomByName: (name) ->
    @rooms[name] ?=
      white: undefined
      black: undefined
      board: new Board()
