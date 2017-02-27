Webpack = require 'webpack'
path = require 'path'
appPath = path.resolve __dirname, 'client'
nodeModulesPath = path.resolve __dirname, 'node_modules'
buildPath = path.resolve __dirname, 'pub', 'build'

config =
  context: __dirname
  devtool: 'eval-source-map'
  entry: [
    path.resolve appPath, '_dev.js'
    path.resolve appPath, 'index.js'
  ]
  output:
    path: buildPath
    filename: 'bundle.js'
    publicPath: '/assets/'
  module: loaders: [
    {
      test: /\.js$/
      loaders: ['react-hot-loader', 'babel-loader']
      exclude: [ nodeModulesPath ]
    }
    {
      # development only
      test: require.resolve('react-addons-perf')
      loader: 'expose-loader?Perf'
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
      test: /\.less$/
      loader: 'style-loader!css-loader!less-loader'
    }
    {
      test: /\.scss$/
      loader: 'style-loader!css-loader!sass-loader'
    }
    {
      test: /\.(woff|woff2)$/
      loader: "url-loader?limit=10000&minetype=application/font-woff"
    }
    {test: /\.eot$/,  loader: "file-loader" }
    {test: /\.svg$/,  loader: "url-loader?limit=10000&mimetype=image/svg+xml" }
    {test: /\.ttf$/,  loader: "url-loader?limit=10000&mimetype=application/octet-stream" }
  ]
  plugins: [ new (Webpack.HotModuleReplacementPlugin) ]

module.exports = config
