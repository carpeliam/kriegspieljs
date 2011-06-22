sys = require 'sys'
connect = require 'connect'
sio = require 'socket.io'

# Board = require './board'
Room = require './room'


Kriegspiel = (options = {}) ->
  return new arguments.callee arguments unless (this instanceof arguments.callee)
  
  settings = port: options.port or 8124
  sockets = {}
  rooms = []
  
  
  
  createServer = ->
    server = connect.createServer()
    server.use connect.static(process.cwd() + '/public')
    server.use connect.logger()
    server.use require("browserify")
      mount:   '/require.js'
      base:    __dirname
      require: ['underscore']
    
    io = sio.listen server
    
    createRoom = ->
      roomNumber = rooms.length + 1
      channel = io.of('/rooms/' + roomNumber)
      channel.on 'disconnect', ->
        console.log 'room disconnect'
      room = new Room(channel)
      rooms.push room
    
    createRoom(io)
    io.sockets.on 'connection', (socket) ->
      # join first room when connected
      socket.emit "room.join", rooms[0].channel.name, rooms[0].board
      
      socket.on "room.create", ->
        createRoom(io)
        
      
      socket.on "nickname.set", (name) ->
        socket.set "nickname", name
    
    return server
  
  server = createServer()
  server.listen settings.port
  
  sys.log 'Server started on port ' + settings.port

module.exports = Kriegspiel