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
    # {
    #   test: require.resolve('react')
    #   loader: 'expose?React'
    # }
    {
      test: /\.coffee$/
      loader: 'coffee-loader'
    }
    {
      test: /\.css$/
      loader: 'style!css'
    }
    {
      test: /\.less$/
      loader: 'style!css!less'
    }
    {
      test: /\.scss$/
      loader: 'style!css!sass'
    }
    {
      test: /\.(woff|woff2)$/
      loader: "url?limit=10000&minetype=application/font-woff"
    }
    {test: /\.eot$/,  loader: "file" }
    {test: /\.svg$/,  loader: "url?limit=10000&mimetype=image/svg+xml" }
    {test: /\.ttf$/,  loader: "url?limit=10000&mimetype=application/octet-stream" }
  ]
  plugins: [ new (Webpack.HotModuleReplacementPlugin) ]

module.exports = config
