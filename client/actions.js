import shortid from 'shortid';
import { fetchUser, setUser as setUserCookie } from './cookie-monster';
import Board from '../lib/board.coffee';

export const SET_USER = 'SET_USER';
export const UPDATE_PLAYER = 'UPDATE_PLAYER';
export const UPDATE_BOARD = 'UPDATE_BOARD';
export const RESET_GAME = 'RESET_GAME';
export const GAME_EVENT = 'GAME_EVENT';
export const UPDATE_MEMBERS = 'UPDATE_MEMBERS';
export const ADD_MESSAGE = 'ADD_MESSAGE';

export function setUser(name) {
  const user = { id: fetchUser().id, name };
  setUserCookie(user);
  return (dispatch, getState, socket) => {
    socket.emit('nickname.set', name);
    dispatch({ type: SET_USER, user });
  };
}

export function updatePlayer(color, user) {
  return (dispatch) => {
    dispatch({ type: UPDATE_PLAYER, color, user });
    if (user) {
      dispatch(processAnnouncement(`${user.name} sat down as ${color}`));
    } else {
      dispatch(processAnnouncement(`${color} stood up`));
    }
  };
}

export function sitAs(color, user) {
  return (dispatch, getState, socket) => socket.emit('sit', color);
}

export function stand() {
  return (dispatch, getState, socket) => socket.emit('stand');
}

export function updateBoard(board) {
  return { type: UPDATE_BOARD, board };
}

export function resetGame(board) {
  return { type: RESET_GAME, board };
}

function processBoardAction(dispatch, getState) {
  return (actionWithBoard) => {
    const postMoveActions = [];
    const board = new Board({
      gameState: getState().game.board,
      onCheck: () => postMoveActions.push({ type: GAME_EVENT, name: 'check' }),
      onMate: () => postMoveActions.push({ type: GAME_EVENT, name: 'mate' }),
      onAdvancement: (x, y) => postMoveActions.push({
        type: GAME_EVENT,
        name: 'pawnAdvance',
        square: { x, y },
      }),
    });
    actionWithBoard(board);
    const gameState = board.gameState();
    dispatch(updateBoard(gameState));
    postMoveActions.forEach(action => dispatch(action));
    for (const capture in board.pawnCaptures()) {
      dispatch(processAnnouncement(`The pawn on ${capture} can make a capture.`));
    }
  }
}

export function updateBoardWithMove(origCoords, newCoords) {
  return (dispatch, getState) => {
    processBoardAction(dispatch, getState)((board) => {
      board.move(origCoords.x, origCoords.y, newCoords.x, newCoords.y);
    });
  }
}

export function updateBoardWithPromotion(square, newPieceValue) {
  return (dispatch, getState) => {
    processBoardAction(dispatch, getState)((board) => {
      board.promote(square, newPieceValue);
    });
  }
}

export function move(origCoords, newCoords) {
  return (dispatch, getState, socket) => socket.emit('board.move', origCoords, newCoords);
}

export function onPromotionSelection(square, newPieceValue) {
  return (dispatch, getState, socket) => socket.emit('board.promote', square, newPieceValue);
}

export function updateMembers(members) {
  return (dispatch, getState) => {
    const existingMembers = getState().members;
    dispatch({ type: UPDATE_MEMBERS, members });

    const currentMemberIds = members.map(m => m.id);
    const existingMemberIds = existingMembers.filter(m => m.name).map(m => m.id);
    existingMembers.forEach((member) => {
      if (!currentMemberIds.includes(member.id)) {
        dispatch(processAnnouncement(`${member.name} disconnected`));
      }
    });
    members.forEach((member) => {
      if (member.name && !existingMemberIds.includes(member.id)) {
        dispatch(processAnnouncement(`${member.name} connected`));
      }
    });
  };
}

export function sendMessage(msg) {
  return (dispatch, getState, socket) => socket.emit('speak', msg);
}

export function processMessage(author, message) {
  return { type: ADD_MESSAGE, message: { type: 'chat', message, author } };
}

export function processAnnouncement(message) {
  return { type: ADD_MESSAGE, message: { type: 'event', message } };
}
