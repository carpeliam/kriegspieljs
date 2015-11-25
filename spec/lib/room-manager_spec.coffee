mocket = require 'mocket-io'
RoomManager = require("#{__dirname}/../../lib/room-manager")


describe 'Room Manager', ->
  mgr = undefined
  server = undefined
  client = undefined
  serverSocket = undefined
  clientSocket = undefined
  incrementalSocketId = 0

  beforeEach (done) ->
    server = new mocket.Server()
    client = new mocket.Client(server)
    server.once 'connection', (socket) ->
      serverSocket = socket
    server.on 'connection', (socket) ->
      socket.handshake =
        headers:
          cookie: "connect.sid=abc#{incrementalSocketId++}"
      done()

    mgr = new RoomManager(server.sockets)
    clientSocket = client.connect()



  it 'places connections in the Lobby by default', ->
    expect(serverSocket.rooms).toContain 'Lobby'

  it 'allows a user to specify a nickname', (done) ->
    clientSocket.on 'room.list', (names) ->
      expect(names).toContain 'Bobby'
      done()
    clientSocket.emit 'nickname.set', 'Bobby'


  describe 'sitting', ->
    beforeEach -> clientSocket.emit 'nickname.set', 'Bobby'
    it 'allows a player to sit in an unoccupied seat if they are not already seated', (done) ->
      clientSocket.on 'sit', (color, name) ->
        expect(color).toEqual('white')
        expect(name).toEqual('Bobby')
        done()
      clientSocket.emit 'sit', 'white', (success) ->
        expect(success).toBe true
    it 'does not allow a player to sit in an occupied seat', (done) ->
      clientSocket.emit 'sit', 'white'
      newClientSocket = new mocket.Client(server).connect()
      newClientSocket.emit 'nickname.set', 'Boris'
      newClientSocket.emit 'sit', 'white', (success) ->
        expect(success).toBe false
        done()

    it 'does not allow a player to sit if they are already seated', (done) ->
      clientSocket.on 'sit', ->
        clientSocket.emit 'sit', 'black', (success) ->
          expect(success).toBe false
          done()
      clientSocket.emit 'sit', 'white', (success) ->
        expect(success).toBe true

  describe 'standing', ->
    beforeEach (done) ->
      clientSocket.emit 'nickname.set', 'Bobby'
      clientSocket.emit 'sit', 'white', (success) ->
        expect(success).toBe true
        done()
    it 'does not allow a player to abandon a game', (done) ->
      newClientSocket = new mocket.Client(server).connect()
      newClientSocket.emit 'nickname.set', 'Boris'
      newClientSocket.emit 'sit', 'black'
      clientSocket.emit 'stand', (success) ->
        expect(success).toBe false
        done()

    it 'allows a player to stand if a game is not in progress', (done) ->
      clientSocket.on 'stand', (color) ->
        expect(color).toEqual 'white'
        done()
      clientSocket.emit 'stand', (success) ->
        expect(success).toBe true

    it 'fails if the client is not currently sitting', (done) ->
      newClientSocket = new mocket.Client(server).connect()
      newClientSocket.emit 'nickname.set', 'Boris'
      newClientSocket.emit 'stand', (success) ->
        expect(success).toBe false
        done()

