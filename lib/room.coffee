parseCookie = (require 'cookie').parse
Board = require './board'

getID = (client) ->
  parseCookie(client.handshake.headers.cookie)['connect.sid']

class Room
  constructor: (@channel) ->
    @white = @black = undefined
    @clients = {}
    @createNewBoard()

    @channel.on 'connection', (socket) =>
      socket.on 'nickname.set', (name) =>
        @clients[getID(socket)] = id: socket.id, nickname: name
        @channel.emit 'room.list', (client.nickname for id, client of @clients)
        socket.broadcast.emit 'announcement', "#{name} connected"
        socket.emit 'sit', 'white', @clients[@white] if @white?
        socket.emit 'sit', 'black', @clients[@black] if @black?

      socket.on 'sit', (color) =>
        canSit = switch color
          when 'white' then @sitAsWhite socket
          when 'black' then @sitAsBlack socket
          else false
        @channel.emit 'sit', color, @clients[getID(socket)] if canSit

      socket.on 'stand', (color) =>
        canStand = switch color
          when 'white' then @standAsWhite()
          when 'black' then @standAsBlack()
          else false
        @channel.emit 'stand', color
        @checkForReset()

      socket.on 'speak', (msg) =>
        socket.broadcast.emit 'speak', @clients[getID(socket)].nickname, msg

      socket.on 'board.move', (from, to, callback) =>
        if @currentPlayer() == getID(socket) and @board.move from.x, from.y, to.x, to.y
          callback?(true)
          @channel.emit 'board.move', from, to
        else
          callback?(false)

      socket.on 'board.promote', ({x, y}, promotionChoice) =>
        if @board.promote {x, y}, promotionChoice
          @channel.emit 'board.promote', {x, y}, promotionChoice

      socket.on 'disconnect', =>
        identity = getID(socket)
        if identity is @white
          @white = undefined
          @channel.emit 'stand', 'white'
        else if identity is @black
          @black = undefined
          @channel.emit 'stand', 'black'
        @checkForReset()
        if @clients[identity]?
          socket.broadcast.emit 'announcement', "#{@clients[identity].nickname} disconnected"
        delete @clients[identity]
        socket.broadcast.emit 'room.list', (client.nickname for id, client of @clients)

  createNewBoard: ->
    @board = new Board
      onMate: =>
        @endGame()
    @inAction = false

  sitAsWhite: (client) ->
    identity = getID(client)
    if !@white? and @clients[identity]? and @black isnt identity
      @white = identity

  sitAsBlack: (client) ->
    identity = getID(client)
    if !@black? and @clients[identity]? and @white isnt identity
      @black = identity

  checkForReset: ->
    if !@white? and !@black?
      @createNewBoard()
      @channel.emit 'board.reset', @board

  standAsWhite: ->
    unless @inAction
      @white = undefined

  standAsBlack: ->
    unless @inAction
      @black = undefined

  startGame: ->
    @inAction = @white? and @black?

  currentPlayer: ->
    switch @board.turn
      when 1 then @white
      when -1 then @black
      else undefined

  endGame: ->
    @inAction = false

module.exports = Room
