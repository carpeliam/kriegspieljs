// TODO move this to a loader? only need to run this once in suite
// import 'babel-core/polyfill';
if (!window._babelPolyfill) {
  require('babel-core/polyfill');
}
