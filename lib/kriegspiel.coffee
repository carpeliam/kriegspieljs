util = require 'util'
connect = require 'connect'
path = require 'path'

serveStatic = require 'serve-static'
logger = require 'connect-logger'
session = require 'express-session'

GameManager = require './game-manager'


Kriegspiel = (options = {}) ->
  return new arguments.callee arguments unless (this instanceof arguments.callee)

  settings = port: options.port or 8124
  createServer = ->
    server = connect()
    http = require('http').createServer(server)
    server.use serveStatic("#{process.cwd()}/public")
    server.use logger()
    server.use session(secret: 'WarGames')

    if process.env.NODE_ENV != 'production'
      webpackDevMiddleware = require 'webpack-dev-middleware'
      webpackHotMiddleware = require 'webpack-hot-middleware'
      webpack = require 'webpack'
      webpackConfig = require '../webpack.config'
      compiler = webpack(webpackConfig)

      server.use webpackDevMiddleware(compiler, noInfo: true, publicPath: '/assets/')
      server.use webpackHotMiddleware compiler

    io = (require 'socket.io')(http)
    new GameManager(io.sockets)

    return http

  server = createServer()
  server.listen settings.port, ->
    util.log "Server started on port #{settings.port}"

module.exports = Kriegspiel
