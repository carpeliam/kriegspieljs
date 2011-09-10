sys = require 'sys'
connect = require 'connect'

# Board = require './board'
Room = require './room'


Kriegspiel = (options = {}) ->
  return new arguments.callee arguments unless (this instanceof arguments.callee)
  
  settings = port: options.port or 8124
  sockets = {}
  rooms = []
  # rooms = {lobby: new Room('lobby')}
  
  
  
  createServer = ->
    server = connect.createServer()
    server.use connect.static(process.cwd() + '/public')
    server.use connect.logger()
    server.use connect.cookieParser()
    server.use connect.session(secret: 'WarGames')
    server.use require("browserify")
      mount:   '/require.js'
      base:    __dirname
      require: ['underscore']
    
    io = (require 'socket.io').listen server
    
    createRoom = ->
      roomNumber = rooms.length + 1
      channel = io.of('/rooms/' + roomNumber)
      room = new Room(channel)
      rooms.push room
    
    createRoom(io)
    io.sockets.on 'connection', (socket) ->
      # join first room when connected
      socket.emit "room.join", rooms[0].channel.name, rooms[0].board
      
      socket.on "room.create", ->
        createRoom(io)
    
    return server
  
  server = createServer()
  # (require './comm').initialize server
  server.listen settings.port
  
  sys.log 'Server started on port ' + settings.port

module.exports = Kriegspiel