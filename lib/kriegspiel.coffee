# http = require 'http'
sys = require 'sys'
# static = require 'node-static'
connect = require 'connect'

Kriegspiel = (options = {}) ->
  unless (this instanceof arguments.callee)
    return new arguments.callee arguments
  
  settings = port: options.port or 8124
  
  createServer = ->
    connect(
      connect.logger()
    , connect.static process.cwd() + '/public')
  
  server = createServer()
  server.listen settings.port
  sys.log 'Bam! http://localhost:' + settings.port

module.exports = Kriegspiel