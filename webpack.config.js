const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const appPath = path.resolve(__dirname, 'client');
const buildPath = path.resolve(__dirname, 'public', 'assets');

const isDev = process.env.NODE_ENV !== 'production';

const loaders = [
  { test: /\.js$/, loaders: ['babel-loader'], exclude: [/node_modules/] },
  {
    test: /\.scss$/,
    loaders: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: ['css-loader', 'sass-loader'],
    }),
  },
];
if (isDev) {
  loaders.find(loader => loader.test.toString() === /\.js$/.toString()).loaders.unshift('react-hot-loader');
  loaders.find(loader => loader.test.toString() === /\.scss$/.toString()).loaders.unshift('css-hot-loader');
  loaders.push({ test: require.resolve('react-addons-perf'), loader: 'expose-loader?Perf' });
}

const plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production')
  }),
  new ExtractTextPlugin('index.css'),
];
plugins.push(isDev ? new webpack.HotModuleReplacementPlugin() : new webpack.optimize.UglifyJsPlugin());

entry = isDev ?
  ['webpack-hot-middleware/client', path.resolve(appPath, '_dev.js'), path.resolve(appPath, 'index.js')] :
  path.resolve(appPath, 'index.js');

module.exports = {
  context: __dirname,
  devtool: isDev ? 'eval-source-map' : 'cheap-module-source-map',
  entry,
  output: {
    path: buildPath,
    filename: 'bundle.js',
    publicPath: '/assets/',
  },
  module: { loaders },
  plugins,
};
