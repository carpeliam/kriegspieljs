GameManager = require("#{__dirname}/../../lib/game-manager")
Game = require("#{__dirname}/../../lib/game")
io = require 'socket.io-client'

describe 'GameManager', ->
  server = undefined
  beforeEach (done) -> server = new Server done
  afterEach (done) -> server.close done

  it 'tells other clients when a client has set their nickname', (done) ->
    server.connect().then (client1) ->
      client1.withName 'Bobby'
      server.connect().then (client2) ->
        client2.withName 'Gary'
        client1.on 'room.list', (roomList) ->
          expect(roomList).toEqual [client1.json(), client2.json()]
          done()

  describe 'sitting', ->
    client = undefined
    beforeEach (done) ->
      server.connect().then (newClient) ->
        client = newClient
        client.withName 'Bobby'
        done()
    it 'alerts ', (done) ->
      client.on 'sit', (color, sittingClient) ->
        expect(color).toEqual 'white'
        expect(sittingClient).toEqual client.json()
        done()
      client.emit 'sit', 'white'

  describe 'standing', ->
    client = undefined
    beforeEach (done) ->
      server.connect().then (newClient) ->
        client = newClient
        client.withName 'Bobby'
        client.emit 'sit', 'white'
        done()
    it 'makes the standing players seat absent and informs all clients', (done) ->
      client.on 'stand', (color) ->
        expect(color).toEqual 'white'
        done()
      client.emit 'stand'

  describe 'with two seated players', ->
    white = undefined
    black = undefined
    beforeEach ->
      server.connect().then (client) ->
        white = client
        white.withName 'Bobby'
        white.emit 'sit', 'white'
        server.connect().then (client) ->
          black = client
          black.withName 'Gary'
          roomHasTwoMembers = new Promise (resolve) ->
            white.on 'room.list', (roomList) -> resolve() if roomList.length == 2
          blackHasSat = new Promise (resolve) ->
            white.on 'sit', (color) -> resolve() if color == 'black'
          black.emit 'sit', 'black'
          Promise.all([roomHasTwoMembers, blackHasSat])
    it 'forwards resignations to other users', (done) ->
      black.on 'board.move', ->
        black.on 'game.resign', (color, board) ->
          expect(color).toEqual 'white'
          expect(board.inProgress).toBeFalsy()
          done()
        white.emit 'resign'
      white.emit 'board.move', {x: 0, y: 1}, {x: 0, y: 2}
    it 'resets the game if both players stand', (done) ->
      white.on 'game.reset', ({ board }) ->
        emptyGame = new Game()
        expect(new Game(gameState: board).gameState()).toEqual emptyGame.gameState()
        done()
      white.emit 'stand'
      black.emit 'stand'

    describe 'when a new client connects', ->
      it 'immediately informs them of the game state', (done) ->
        black.on 'board.move', ->
          recreatedGame = new Game()
          recreatedGame.move 5, 1, 5, 3
          server.connect().then (client) ->
            expect(new Game(gameState: client.board).gameState()).toEqual recreatedGame.gameState()
            done()
        white.emit 'board.move', {x: 5, y: 1}, {x: 5, y: 3}
      it 'informs them of seated players', (done) ->
        server.connect().then (client) ->
          calls = []
          client.on 'sit', (color, sittingClient) ->
            calls.push { color, sittingClient }
            return if calls.length < 2
            expect(calls).toContain { color: 'white', sittingClient: white.json() }
            expect(calls).toContain { color: 'black', sittingClient: black.json() }
            done()
          client.withName 'Jim'

    describe 'moving', ->
      it 'reports moves to all users', (done) ->
        black.on 'board.move', (from, to) ->
          expect(from).toEqual {x: 0, y: 1}
          expect(to).toEqual {x: 0, y: 2}
          done()
        white.emit 'board.move', {x: 0, y: 1}, {x: 0, y: 2}

    describe 'promotion', ->
      it 'alerts other clients when one client promotes a piece', (done) ->
        spyOn(Game.prototype, 'promote').and.returnValue true
        black.on 'board.promote', (coord, newPieceType) ->
          expect(coord).toEqual {x: 0, y: 0}
          expect(newPieceType).toEqual 5
          expect(Game.prototype.promote).toHaveBeenCalledWith {x: 0, y: 0}, 5
          done()
        white.emit 'board.promote', {x: 0, y: 0}, 5

    describe 'speaking', ->
      it 'forwards chat messages to other clients', (done) ->
        black.on 'speak', (author, msg) ->
          expect(author).toEqual white.json()
          expect(msg).toEqual 'prepare to be mated!'
          done()
        white.emit 'speak', 'prepare to be mated!'

    describe 'disconnecting', ->
      it 'sends an updated room.list to other clients', (done) ->
        white.on 'room.list', (roomList) ->
          expect(roomList).toEqual [white.json()]
          done()
        black.disconnect()
      it 'forces a sitting player to stand', (done) ->
        white.on 'stand', (color) ->
          expect(color).toEqual 'black'
          done()
        black.disconnect()

class Client
  constructor: (@ioClient, @board, @id) ->
  on: (args...) -> @ioClient.on args...
  emit: (args...) -> @ioClient.emit args...
  disconnect: () -> @ioClient.disconnect()
  withName: (@nickname) -> @ioClient.emit 'nickname.set', @nickname
  json: -> id: @id, name: @nickname

class Server
  constructor: (done) ->
    @openConnections = 0
    @httpServer = require('http').createServer()
    ioServer = require('socket.io')(@httpServer)
    ioServer.on 'connection', (serverSocket) =>
      cookieId = "abc#{++@openConnections}"
      serverSocket.handshake =
        headers:
          cookie: "connect.sid=#{cookieId}; kriegspiel.user=#{JSON.stringify(id: cookieId)}"
    @httpServer.listen () =>
      @mgr = new GameManager(ioServer)
      @url = "http://localhost:#{@httpServer.address().port}"
      done()
  connect: (existingId) ->
    ioConnectOptions =
      transports: ['websocket']
      forceNew: true
    client = io.connect @url, ioConnectOptions
    new Promise (resolve, reject) =>
      client.on 'connect', =>
        client.once 'board.update', ({ board }) =>
          resolve(new Client(client, board, "abc#{@openConnections}"))
  close: (done) => @httpServer.close done
