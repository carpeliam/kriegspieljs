Board = require('./board')
parseCookie = require('cookie').parse

getID = (client) ->
  parseCookie(client.handshake.headers.cookie)['connect.sid']

oppositeColor = (color) -> if color is 'white' then 'black' else 'white'

roomFor = (socket) ->
  for room in socket.rooms
    return room unless room is socket.id

wrapSocket = (mgr, socket) ->
  wrapper =
    onSetNickname: (nickname) ->
      client = mgr.addClientFor socket, nickname
      room = mgr.roomFor socket
      ['white', 'black'].forEach (color) =>
        if room[color]?
          room[color] = client if room[color].abandoned and room[color].id is getID(socket)
          socket.emit 'sit', color, client
      # socket.to(room.name).emit 'room.list', mgr.namesIn(room.name)
      socket.emit 'room.list', mgr.namesIn(room.name)

    onSit: (color, cb) ->
      client = mgr.clientFor socket
      room = mgr.roomFor socket
      if !room[color]? and client? and room[oppositeColor(color)] isnt client
        room[color] = client
        cb?(true)
        socket.emit 'sit', color, client
        # @server.to(room.name).emit 'sit', color, client
      else
        cb?(false)

    onStand: (cb) ->
      client = mgr.clientFor socket
      room = mgr.roomFor socket
      if room.white? and room.black?
        cb?(false)
      else
        color = ['white', 'black'].find (c) -> room[c] is client
        if color?
          room[color] = undefined
          cb?(true)
          socket.emit 'stand', color
          # @server.to(room.name).emit 'stand', color
        else
          cb?(false)

    onBoardMove: (from, to, cb) ->
      client = mgr.clientFor socket
      room = mgr.roomFor socket
      board = room.board
      color = if board.turn is 1 then 'white' else 'black'
      if room[color] is client and board.move(from.x, from.y, to.x, to.y)
        cb?(true)
        socket.emit 'board.move', from, to
      else
        cb?(false)

    onBoardPromote: ({x, y}, newPieceType, cb) ->
      client = mgr.clientFor socket
      room = mgr.roomFor socket
      board = room.board
      if board.promote {x, y}, newPieceType
        cb?(true)
        socket.emit 'board.promote', {x, y}, newPieceType
      else
        cb?(false)

    onDisconnect: ->
      client = mgr.clientFor socket
      room = mgr.roomFor socket
      if color = ['white', 'black'].find((c) => room[c]?.id is socket.id)
        room[color] = {id: getID(socket), name: client.name, abandoned: true}
      mgr.removeClientFor socket
      socket.emit 'room.list', mgr.namesIn(room.name)
      # @server.to(room.name).emit 'room.list', mgr.namesIn(room.name)

module.exports = class RoomManager
  constructor: (@server) ->
    @clients = {}
    @rooms = {}
    @server.on 'connection', (socket) =>
      socket.join 'Lobby'
      socket.emit 'room.join', @getRoomByName('Lobby')

      socket.on 'nickname.set', wrapSocket(this, socket).onSetNickname
      socket.on 'sit', wrapSocket(this, socket).onSit
      socket.on 'stand', wrapSocket(this, socket).onStand

      socket.on 'board.move', wrapSocket(this, socket).onBoardMove
      socket.on 'board.promote', wrapSocket(this, socket).onBoardPromote

      socket.on 'disconnect', wrapSocket(this, socket).onDisconnect

  addClientFor: (socket, nickname) ->
    client = {id: socket.id, name: nickname}
    @clients[getID(socket)] = client
    return client
  clientFor: (socket) -> @clients[getID(socket)]
  removeClientFor: (socket) ->
    socket.leave @roomFor(socket).name
    delete @clients[getID(socket)]
  roomFor: (socket) -> @getRoomByName(roomFor(socket))

  namesIn: (room) ->
    names = []
    for socket in @server.sockets
      if room in socket.rooms
        names.push(@clientFor(socket)) unless names.some (n) -> n.id is socket.id
    return names

  getRoomByName: (name) ->
    @rooms[name] ?=
      name: name
      white: undefined
      black: undefined
      board: new Board()
