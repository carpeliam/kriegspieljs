webpack = require 'webpack'
ExtractTextPlugin = require('extract-text-webpack-plugin')
path = require 'path'
appPath = path.resolve __dirname, 'client'
buildPath = path.resolve __dirname, 'public', 'assets'

isDev = process.env.NODE_ENV != 'production'

loaders = [
  {
    test: /\.js$/
    loaders: ['babel-loader']
    exclude: [ /node_modules/ ]
  }
  {
    test: /\.coffee$/
    loader: 'coffee-loader'
  }
  {
    test: /\.css$/
    loader: 'style-loader!css-loader'
  }
  {
    test: /\.scss$/
    loader: ExtractTextPlugin.extract(fallback: 'style-loader', use: ['css-loader', 'sass-loader'])
  }
  {
    test: /\.(woff|woff2)$/
    loader: "url-loader?limit=10000&minetype=application/font-woff"
  }
  {test: /\.eot$/,  loader: "file-loader" }
  {test: /\.svg$/,  loader: "url-loader?limit=10000&mimetype=image/svg+xml" }
  {test: /\.ttf$/,  loader: "url-loader?limit=10000&mimetype=application/octet-stream" }
]

if isDev
  loaders[0].loaders.unshift 'react-hot-loader'
  loaders.push {
    test: require.resolve('react-addons-perf')
    loader: 'expose-loader?Perf'
  }

plugins = [
  new webpack.DefinePlugin
    'process.env.NODE_ENV': JSON.stringify(if isDev then 'development' else 'production')
  new ExtractTextPlugin 'index.css'
]

plugins.push if isDev
    new webpack.HotModuleReplacementPlugin()
  else
    new webpack.optimize.UglifyJsPlugin()

entry = if isDev then [
  path.resolve appPath, '_dev.js'
  path.resolve appPath, 'index.js'
] else path.resolve appPath, 'index.js'

module.exports =
  context: __dirname
  devtool: if isDev then 'eval-source-map' else 'cheap-module-source-map'
  entry: entry
  output:
    path: buildPath
    filename: 'bundle.js'
    publicPath: '/assets/'
  module: loaders: loaders
  plugins: plugins

