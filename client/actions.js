import shortid from 'shortid';
import { fetchUser, setUser as setUserCookie } from './cookie-monster';
import Board from '../lib/board.coffee';

export const SET_USER = 'SET_USER';
export const UPDATE_PLAYER = 'UPDATE_PLAYER';
export const UPDATE_BOARD = 'UPDATE_BOARD';
export const GAME_EVENT = 'GAME_EVENT';

export function setUser(name) {
  const user = { id: fetchUser().id, name };
  setUserCookie(user);
  return (dispatch, getState, socket) => {
    socket.emit('nickname.set', name);
    dispatch({ type: SET_USER, user });
  };
}

export function updatePlayer(color, user) {
  return { type: UPDATE_PLAYER, color, user };
}

export function sitAs(color, user) {
  return (dispatch, getState, socket) => {
    socket.emit('sit', color);
    dispatch(updatePlayer(color, user));
  }
}

export function standAs(color) {
  return { type: UPDATE_PLAYER, color, user: undefined };
}

export function updateBoard(board) {
  return { type: UPDATE_BOARD, board };
}

export function updateBoardWithMove(origCoords, newCoords) {
  return (dispatch, getState) => {
    const postMoveActions = [];
    const board = new Board({
      gameState: getState().game.board,
      onCheck: () => postMoveActions.push({ type: GAME_EVENT, name: 'check' }),
      onMate: () => postMoveActions.push({ type: GAME_EVENT, name: 'mate' }),
    });
    board.move(origCoords.x, origCoords.y, newCoords.x, newCoords.y);
    const gameState = board.gameState();
    dispatch(updateBoard(gameState));
    postMoveActions.forEach(action => dispatch(action));
  }
}

export function move(origCoords, newCoords) {
  return (dispatch, getState, socket) => {
    socket.emit('board.move', origCoords, newCoords);
  };
}
