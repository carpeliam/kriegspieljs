# http = require 'http'
sys = require 'sys'
# static = require 'node-static'
connect = require 'connect'

Kriegspiel = (options = {}) ->
  return new arguments.callee arguments unless (this instanceof arguments.callee)
  
  settings = port: options.port or 8124
  
  createServer = ->
    server = connect.createServer()
    server.use connect.static(process.cwd() + '/public')
    server.use connect.logger()
    server.use require("browserify")(
      mount:   '/require.js',
      base:    __dirname,
      require: ['underscore']
    )
  
  server = createServer()
  server.listen settings.port
  sys.log 'Server started on port ' + settings.port

module.exports = Kriegspiel