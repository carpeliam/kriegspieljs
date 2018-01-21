const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const appPath = path.resolve(__dirname, 'client');
const buildPath = path.resolve(__dirname, 'public', 'assets');

const isDev = process.env.NODE_ENV !== 'production';

const defaultStyleLoaders = ExtractTextPlugin.extract({
  fallback: 'style-loader',
  use: ['css-loader', 'sass-loader'],
});

const common = {
  context: __dirname,
  output: {
    path: buildPath,
    filename: 'bundle.js',
    publicPath: '/assets/',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production')
    }),
    new ExtractTextPlugin('index.css'),
  ],
};

if (isDev) {
  module.exports = merge(common, {
    entry: ['webpack-hot-middleware/client', path.resolve(appPath, '_dev.js'), path.resolve(appPath, 'index.js')],
    devtool: 'eval-source-map',
    module: {
      loaders: [
        { test: /\.js$/, loaders: ['react-hot-loader', 'babel-loader'], exclude: [/node_modules/] },
        { test: /\.scss$/, loaders: ['css-hot-loader', ...defaultStyleLoaders] },
        { test: require.resolve('react-addons-perf'), loader: 'expose-loader?Perf' },
      ],
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
  });
} else {
  module.exports = merge(common, {
    entry: path.resolve(appPath, 'index.js'),
    devtool: 'cheap-module-source-map',
    module: {
      loaders: [
        { test: /\.js$/, loader: 'babel-loader', exclude: [/node_modules/] },
        { test: /\.scss$/, use: defaultStyleLoaders },
      ],
    },
    plugins: [new webpack.optimize.UglifyJsPlugin()],
  });
}
