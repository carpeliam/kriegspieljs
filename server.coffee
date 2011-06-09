http = require 'http'
sys = require 'sys'

server = http.createServer (request, response) ->
  response.writeHead 200, {'Content-Type': 'text/plain'}
  response.end sys.inspect(request)
server.listen 8124
console.log 'Bam! http://localhost:8124'
