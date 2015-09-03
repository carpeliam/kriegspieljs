webpack = require 'webpack'
WebpackDevServer = require 'webpack-dev-server'
webpackConfig = require './webpack.config'
path = require 'path'
mainPath = path.resolve __dirname, '..', 'client', 'app.js'

module.exports = ->
  bundleStart = null
  compiler = webpack(webpackConfig)

  compiler.plugin 'compile', ->
    console.log 'Bundling...'
    bundleStart = Date.now()
  compiler.plugin 'done', -> console.log "Bundled in #{Date.now() - bundleStart} ms!"

  bundler = new WebpackDevServer(compiler,
    publicPath: '/build/'
    inline: true
    hot: true
    quiet: false
    noInfo: true
    stats: colors: true)

  bundler.listen 3001, 'localhost', -> console.log 'Bundling project, please wait...'
