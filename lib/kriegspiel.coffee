http = require 'http'
sys = require 'sys'

Kriegspiel = (options) ->
  server = http.createServer (request, response) ->
    response.writeHead 200, {'Content-Type': 'text/plain'}
    response.end sys.inspect(request)
  server.listen options.port or 8124
  console.log 'Bam! http://localhost:8124'

module.exports = Kriegspiel