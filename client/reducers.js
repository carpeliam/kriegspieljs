import { combineReducers } from 'redux';
import { SET_USER, UPDATE_PLAYER, UPDATE_BOARD } from './actions';
import Board from '../lib/board.coffee';

export function user(state = null, action) {
  switch (action.type) {
    case SET_USER:
      return action.user;
    default:
      return state;
  }
}

export function game(state = { players: {}, board: new Board().gameState() }, action) {
  switch (action.type) {
    case UPDATE_PLAYER:
      const user = action.user && Object.assign({}, action.user);
      const players = {
        white: (action.color === 'white') ? user : state.players.white,
        black: (action.color === 'black') ? user : state.players.black,
      };
      return Object.assign({}, state, { players });
    case UPDATE_BOARD:
      return Object.assign({}, state, { board: action.board });
    default:
      return state;
  }
}

export default combineReducers({ user, game });
