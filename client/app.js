import React from 'react';
import { createStore, compose, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import reducer from './reducers';
import { fetchUser } from './cookie-monster';
import KriegspielContainer from './kriegspiel-container';

const store = createStore(
  reducer,
  { user: fetchUser() },
  compose(
    applyMiddleware(thunkMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);

export default function App() {
  return (
    <Provider store={store}>
      <KriegspielContainer />
    </Provider>
  );
}
