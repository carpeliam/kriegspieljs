Board = require('./board')
parseCookie = require('cookie').parse

getKriegspielId = (client) ->
  kriegspielUser = parseCookie(client.handshake.headers.cookie)['kriegspiel.user']
  JSON.parse(kriegspielUser).id

module.exports = class GameManager
  constructor: (@server) ->
    @board = new Board()
    @clients = {}
    @players = {}
    @server.on 'connection', (socket) =>
      socket.emit 'board.update', board: @board

      socket.on 'nickname.set', (nickname) =>
        @addClient socket, nickname
        @server.emit 'room.list', Object.values(@clients)
        ['white', 'black'].forEach (color) =>
          if player = @players[color]
            socket.emit 'sit', color, player

      socket.on 'sit', (color) =>
        sittingPlayer = @clients[socket.id]
        @players[color] = sittingPlayer
        @server.emit 'sit', color, sittingPlayer

      socket.on 'stand', =>
        client = @clients[socket.id]
        color = ['white', 'black'].find (c) => @players[c] is client
        if color?
          delete @players[color]
          @server.emit 'stand', color
          if !@players.white && !@players.black
            @board = new Board()
            @server.emit 'game.reset', board: @board

      socket.on 'board.move', (from, to) =>
        @board.move(from.x, from.y, to.x, to.y)
        @server.emit 'board.move', from, to

      socket.on 'board.promote', (coord, newPieceType) =>
        if @board.promote coord, newPieceType
          @server.emit 'board.promote', coord, newPieceType

      socket.on 'speak', (msg) =>
        client = @clients[socket.id]
        @server.emit 'speak', client, msg

      socket.on 'disconnect', =>
        delete @clients[socket.id]
        @server.emit 'room.list', Object.values(@clients)

  addClient: (socket, nickname) ->
    getKriegspielId(socket)
    @clients[socket.id] = {id: getKriegspielId(socket), name: nickname}
