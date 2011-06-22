_ = require 'underscore'
Board = require './board'
class Room
  constructor: (@channel) ->
    @white = @black = undefined
    @clients = {}
    @board = new Board()
    @inAction = false
    
    @channel.on 'connection', (socket) =>
      @join socket
      socket.emit 'sit', 'white', {id: @white.id, nickname: @clients[@white.id].nickname} if @white?
      socket.emit 'sit', 'black', {id: @black.id, nickname: @clients[@black.id].nickname} if @black?
      
      socket.on "nickname.set", (name) =>
        socket.set "nickname", name
        @clients[socket.id].nickname = name
        @channel.emit 'room.list', ({id: id, nickname: client.nickname} for id, client of @clients when client.nickname?)
      socket.on 'sit', (color) =>
        canSit = switch color
          when 'white' then @sitAsWhite socket
          when 'black' then @sitAsBlack socket
          else false
        @channel.emit 'sit', color, {id: socket.id, nickname: @clients[socket.id].nickname} if canSit
      socket.on 'stand', (color) =>
        canStand = switch color
          when 'white' then @standAsWhite()
          when 'black' then @standAsBlack()
          else false
        @channel.emit 'stand', color
      socket.on 'board.move', (from, to, callback) =>
        if @currentPlayer().id == socket.id and @board.move from.x, from.y, to.x, to.y
          callback(true) if callback?
          @channel.emit 'board.move', from, to
  
  join: (client) ->
    @clients[client.id] = {socket: client}
  
  leave: (client) ->
    delete @clients[client.id] unless client == @white or client == @black
  
  sitAsWhite: (client) ->
    if !@white? and @clients[client.id]? and @black != client
      @white = client
  
  sitAsBlack: (client) ->
    if !@black? and @clients[client.id]? and @white != client
      @black = client
  
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
      else {id: undefined}
  
  endGame: ->
    @inAction = false

module.exports = Room