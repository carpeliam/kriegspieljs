Game = require('./game')
parseCookie = require('cookie').parse

getKriegspielId = (client) ->
  kriegspielUser = parseCookie(client.handshake.headers.cookie)['kriegspiel.user']
  JSON.parse(kriegspielUser).id

module.exports = class GameManager
  constructor: (@server) ->
    @game = new Game()
    @clients = {}
    @players = {}
    @server.on 'connection', (socket) =>
      socket.emit 'board.update', board: @game

      socket.on 'nickname.set', (nickname) =>
        @addClient socket, nickname
        @server.emit 'room.list', (client for id, client of @clients)
        ['white', 'black'].forEach (color) =>
          if player = @players[color]
            socket.emit 'sit', color, player

      socket.on 'sit', (color) =>
        sittingPlayer = @clients[socket.id]
        @players[color] = sittingPlayer
        @server.emit 'sit', color, sittingPlayer

      socket.on 'stand', =>
        @standIfSeated @clients[socket.id]

      socket.on 'resign', =>
        client = @clients[socket.id]
        color = ['white', 'black'].find (c) => @players[c] is client
        @game.inProgress = false
        @server.emit 'game.resign', color, @game

      socket.on 'board.move', (from, to) =>
        @game.move(from.x, from.y, to.x, to.y)
        @server.emit 'board.move', from, to

      socket.on 'board.promote', (coord, newPieceType) =>
        if @game.promote coord, newPieceType
          @server.emit 'board.promote', coord, newPieceType

      socket.on 'speak', (msg) =>
        client = @clients[socket.id]
        @server.emit 'speak', client, msg

      socket.on 'disconnect', =>
        @standIfSeated @clients[socket.id]
        delete @clients[socket.id]
        @server.emit 'room.list', (client for id, client of @clients)

  addClient: (socket, nickname) ->
    getKriegspielId(socket)
    @clients[socket.id] = {id: getKriegspielId(socket), name: nickname}

  standIfSeated: (client) ->
    color = ['white', 'black'].find (c) => @players[c] is client
    if color?
      delete @players[color]
      @server.emit 'stand', color
      if !@players.white && !@players.black
        @game = new Game()
        @server.emit 'game.reset', board: @game
