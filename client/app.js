import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import Kriegspiel from './kriegspiel';

export default function App() {
  return (
    <Provider store={store}>
      <Kriegspiel />
    </Provider>
  );
}
