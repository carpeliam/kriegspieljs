import { combineReducers } from 'redux';
import { SET_USER, UPDATE_PLAYER } from './actions';

export function user(state = null, action) {
  switch (action.type) {
    case SET_USER:
      return action.user;
    default:
      return state;
  }
}

export function game(state = { players: {} }, action) {
  switch (action.type) {
    case UPDATE_PLAYER:
      const user = action.user && Object.assign({}, action.user);
      const players = {
        white: (action.color === 'white') ? user : state.players.white,
        black: (action.color === 'black') ? user : state.players.black,
      };
      return { players };
    default:
      return state;
  }
}

export default combineReducers({ user, game });
