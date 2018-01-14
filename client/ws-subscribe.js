import {
  updateMembers,
  updatePlayer,
  updateBoard,
  resetGame,
  updateBoardWithMove,
  updateBoardWithPromotion,
  processMessage,
} from './actions';
import { fetchUser } from './cookie-monster';

export default function subscribeToSocketEvents(dispatch, socket) {
  socket.on('connect', () => socket.emit('nickname.set', fetchUser().name));
  socket.on('board.update', ({ board }) => dispatch(updateBoard(board)));
  socket.on('game.reset', ({ board }) => dispatch(resetGame(board)));
  socket.on('room.list', members => dispatch(updateMembers(members)));
  socket.on('sit', (color, user) => dispatch(updatePlayer(color, user)));
  socket.on('stand', (color) => dispatch(updatePlayer(color, undefined)));
  socket.on('board.move', (from, to) => dispatch(updateBoardWithMove(from, to)));
  socket.on('board.promote', (square, newPieceValue) => dispatch(updateBoardWithPromotion(square, newPieceValue)));
  socket.on('speak', (author, message) => dispatch(processMessage(author, message)));
}
