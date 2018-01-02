import { updateBoard, updatePlayer, updateBoardWithMove } from './actions';
import { fetchUser } from './cookie-monster';

export default function subscribeToSocketEvents(dispatch, socket) {
  socket.on('connect', () => socket.emit('nickname.set', fetchUser().name));
  socket.on('room.join', ({ board }) => dispatch(updateBoard(board)));
  socket.on('sit', (color, user) => dispatch(updatePlayer(color, user)));
  socket.on('board.move', (from, to) => dispatch(updateBoardWithMove(from, to)));
}
