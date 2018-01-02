import React from 'react';
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import reducer from './reducers';
import { fetchUser } from './cookie-monster';
import KriegspielContainer from './kriegspiel-container';

import io from 'socket.io-client';
import subscribeToSocketEvents from './ws-subscribe';

const user = fetchUser();
const socket = io(location.origin);
const store = createStore(
  reducer,
  { user },
  compose(
    applyMiddleware(thunk.withExtraArgument(socket)),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);
subscribeToSocketEvents(store.dispatch, socket);

export default function App() {
  return (
    <Provider store={store}>
      <KriegspielContainer />
    </Provider>
  );
}
