import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import io from 'socket.io-client';
import reducer from './reducers';
import { fetchUser } from './cookie-monster';
import subscribeToSocketEvents from './ws-subscribe';

const composeEnhancers = process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const user = fetchUser();
const socket = io(location.origin);
const store = createStore(reducer, { user }, composeEnhancers(applyMiddleware(thunk.withExtraArgument(socket))));
subscribeToSocketEvents(store.dispatch, socket);

export default store;
