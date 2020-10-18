const connect = require('connect');
const path = require('path');
const serveStatic = require('serve-static');
const logger = require('connect-logger');
const session = require('express-session');
const GameManager = require('./game-manager');

module.exports = function Kriegspiel(options = { port: process.env.PORT || 8124 }) {
  const server = connect();
  const http = require('http').createServer(server);
  server.use(serveStatic(`${process.cwd()}/public`));
  server.use(logger());
  server.use(session({ secret: 'WarGames' }));
  if (process.env.NODE_ENV !== 'production') {
    const webpack = require('webpack');
    const compiler = webpack(require('../webpack.config'));
    const webpackDevMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');
    server.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: '/assets/' }));
    server.use(webpackHotMiddleware(compiler));
  }
  const io = (require('socket.io'))(http);
  GameManager(io.sockets);

  return http.listen(options.port, () => console.log(`Server started on port ${options.port}`));
}
