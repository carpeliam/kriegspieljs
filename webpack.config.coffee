Webpack = require 'webpack'
path = require 'path'
appPath = path.resolve __dirname, 'client'
nodeModulesPath = path.resolve __dirname, 'node_modules'
buildPath = path.resolve __dirname, 'pub', 'build'
port = process.env.PORT or 8124

config =
  context: __dirname
  devtool: 'eval-source-map'
  entry: [
    "webpack-dev-server/client?http://localhost:#{port}"
    'webpack/hot/dev-server'
    path.resolve appPath, 'app.js'
  ]
  output:
    path: buildPath
    filename: 'bundle.js'
    publicPath: '/build/'
  module: loaders: [
    {
      test: /\.js$/
      loader: 'babel'
      exclude: [ nodeModulesPath ]
    }
    {
      test: /\.coffee$/
      loader: 'coffee-loader'
    }
    {
      test: /\.css$/
      loader: 'style!css'
    }
  ]
  plugins: [ new (Webpack.HotModuleReplacementPlugin) ]

module.exports = config
