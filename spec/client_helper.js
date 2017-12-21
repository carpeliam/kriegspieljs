import jasmineEnzyme from 'jasmine-enzyme';

// TODO move this to a loader? only need to run this once in suite
// import 'babel-polyfill';
if (!window._babelPolyfill) {
  require('babel-polyfill');
}

beforeEach(jasmineEnzyme);
