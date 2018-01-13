import { combineReducers } from 'redux';
import { SET_USER, UPDATE_PLAYER, UPDATE_BOARD, GAME_EVENT, UPDATE_MEMBERS, ADD_MESSAGE } from './actions';
import Board from '../lib/board.coffee';

export function user(state = null, action) {
  switch (action.type) {
    case SET_USER:
      return action.user;
    default:
      return state;
  }
}

const initialGameState = {
  players: {},
  board: new Board().gameState(),
  check: false,
  mate: false,
  pawnAdvance: undefined,
};
export function game(state = initialGameState, action) {
  switch (action.type) {
    case UPDATE_PLAYER:
      const user = action.user && Object.assign({}, action.user);
      const players = {
        white: (action.color === 'white') ? user : state.players.white,
        black: (action.color === 'black') ? user : state.players.black,
      };
      return Object.assign({}, state, { players });
    case UPDATE_BOARD:
      return Object.assign({}, state, { board: action.board, check: false, pawnAdvance: undefined });
    case GAME_EVENT:
      if (action.name === 'pawnAdvance') {
        return Object.assign({}, state, { pawnAdvance: action.square });
      }
      return Object.assign({}, state, { [action.name]: true });
    default:
      return state;
  }
}

export function members(state = [], action) {
  switch (action.type) {
    case UPDATE_MEMBERS:
      return action.members;
    default:
      return state;
  }
}

export function messages(state = [], action) {
  const gameEventMessageMap = { check: 'Check!', mate: 'Checkmate.' };
  switch (action.type) {
    case ADD_MESSAGE:
      return [...state, action.message];
    case GAME_EVENT:
      return [...state, { message: gameEventMessageMap[action.name], type: action.name }];
    default:
      return state;
  }
}

export default combineReducers({ user, game, members, messages });
