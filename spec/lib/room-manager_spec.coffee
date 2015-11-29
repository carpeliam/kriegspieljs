mocket = require 'mocket-io'
RoomManager = require("#{__dirname}/../../lib/room-manager")


class Session
  @count: 0
  constructor: (@server) ->
    @client = new mocket.Client(@server)
  connect: ->
    @server.once 'connection', (@serverSocket) =>
      @cookieId ?= "abc#{Session.count++}"
      @serverSocket.handshake =
        headers:
          cookie: "connect.sid=#{@cookieId}"
    @clientSocket = @client.connect()
    return this
  joinAs: (name) ->
    @clientSocket.emit 'nickname.set', name
    return this
  sit: (color, expectSuccess = true, cb = undefined) ->
    @clientSocket.emit 'sit', color, (success) ->
      expect(success).toBe expectSuccess
      cb?()
    return this
  stand: (expectSuccess = true) ->
    @clientSocket.emit 'stand', (success) ->
      expect(success).toBe expectSuccess
    return this
  move: (from, to, expectSuccess = true, cb = undefined) ->
    @clientSocket.emit 'board.move', from, to, (success) ->
      expect(success).toBe expectSuccess
      cb?()
    return this
  promote: (position, newPieceType, expectSuccess = true, cb = undefined) ->
    @clientSocket.emit 'board.promote', position, newPieceType, (success) ->
        expect(success).toBe expectSuccess
        cb?()
    return this
  disconnect: ->
    @clientSocket.emit 'disconnect'
    return this

describe 'Room Manager', ->
  mgr = undefined
  server = undefined
  session = undefined

  beforeEach ->
    server = new mocket.Server()
    session = new Session(server)
    mgr = new RoomManager(server.sockets)

  it 'places connections in the Lobby by default', ->
    session.connect()
    expect(session.serverSocket.rooms).toContain 'Lobby'

  describe 'setting a nickname', ->
    beforeEach -> session.connect()
    it 'updates the room list', (done) ->
      session.clientSocket.on 'room.list', (names) ->
        expect(names).toContain {id: session.serverSocket.id, name: 'Bobby'}
        done()
      session.joinAs 'Bobby'
    it 'seats the player if they had previously disconnected while sitting', (done) ->
      session.joinAs('Bobby').sit('white').disconnect().connect()
      session.clientSocket.on 'sit', (color, name) ->
        expect(color).toEqual 'white'
        expect(name).toEqual id: session.serverSocket.id, name: 'Bobby'
        done()
      session.joinAs('Bobby')


  describe 'sitting', ->
    beforeEach ->
      session.connect().joinAs('Bobby')
    it 'allows a player to sit in an unoccupied seat if they are not already seated', (done) ->
      session.clientSocket.on 'sit', (color, name) ->
        expect(color).toEqual('white')
        expect(name).toEqual(id: session.serverSocket.id, name: 'Bobby')
        done()
      session.sit('white')

    it 'does not allow a player to sit in an occupied seat', (done) ->
      session.sit('white')
      new Session(server).connect().joinAs('Boris').sit('white', false, done)

    it 'does not allow a player to sit if they are already seated', (done) ->
      session.clientSocket.on 'sit', -> session.sit('black', false, done)
      session.sit('white')

  describe 'standing', ->
    beforeEach ->
      session.connect().joinAs('Bobby').sit('white')
    it 'does not allow a player to abandon a game', ->
      new Session(server).connect().joinAs('Boris').sit('black')
      session.stand(false)

    it 'allows a player to stand if a game is not in progress', (done) ->
      session.clientSocket.on 'stand', (color) ->
        expect(color).toEqual 'white'
        done()
      session.stand()

    it 'fails if the client is not currently sitting', ->
      new Session(server).connect().joinAs('Boris').stand(false)

    it 'resets the board if all players stand'

  describe 'moving', ->
    newSession = undefined
    beforeEach ->
      session.connect().joinAs('Bobby').sit('white')
      newSession = new Session(server).connect().joinAs('Boris').sit('black')
    it 'allows a player to move on their turn', (done) ->
      session.move({x: 0, y: 1}, {x: 0, y: 2}, true, done)
    it 'does not allow illegal moves', (done) ->
      session.move({x: 0, y: 1}, {x: 0, y: 7}, false, done)
    it 'can only be done on the player\'s turn', (done) ->
      newSession.move({x: 0, y: 1}, {x: 0, y: 2}, false, done)
    it 'reports moves', (done) ->
      session.clientSocket.on 'board.move', (from, to) ->
        expect(from).toEqual x: 0, y: 1
        expect(to).toEqual x: 0, y: 2
        done()
      session.move({x: 0, y: 1}, {x: 0, y: 2}, true)

  describe 'board promotion', ->
    promotionSpy = undefined
    beforeEach ->
      session.connect()
      promotionSpy = spyOn(mgr.getRoomByName('Lobby').board, 'promote')
    it 'allows a player to promote a piece if valid', (done) ->
      promotionSpy.andReturn(true)
      session.clientSocket.on 'board.promote', (coords, newPieceType) ->
        expect(coords).toEqual {x: 0, y: 0}
        expect(newPieceType).toEqual 5
        done()
      session.promote({x: 0, y: 0}, 5)
    it 'does not a player to promote a piece if invalid', (done) ->
      promotionSpy.andReturn(false)
      session.promote({x: 0, y: 0}, 5, false, done)

  describe 'disconnecting', ->
    beforeEach ->
      session.connect().joinAs('Bobby').sit('white')
    it 'removes the client from the list', ->
      session.disconnect()
      expect(mgr.clients[session.cookieId]).toBeUndefined()
    it 'sends a new room list', (done) ->
      newSession = new Session(server).connect().joinAs('Boris')
      session.clientSocket.on 'room.list', (names) ->
        expect(names).toEqual [{id: newSession.serverSocket.id, name: 'Boris'}]
        done()
      session.disconnect()
    it 'keeps track of cookie IDs if a player was sitting', ->
      session.disconnect()
      expect(mgr.getRoomByName('Lobby').white).toEqual {id: session.cookieId, name: 'Bobby', abandoned: true}
    it 'stands a player up if a player was sitting', (done) ->
      session.clientSocket.on 'stand', (color) ->
        expect(color).toEqual 'white'
        done()
      session.disconnect()
