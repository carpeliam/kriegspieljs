import { updateBoard, updatePlayer, updateBoardWithMove, updateMembers } from './actions';
import { fetchUser } from './cookie-monster';

export default function subscribeToSocketEvents(dispatch, socket) {
  socket.on('connect', () => socket.emit('nickname.set', fetchUser().name));
  socket.on('board.update', ({ board }) => dispatch(updateBoard(board)));
  socket.on('room.list', members => dispatch(updateMembers(members)));
  socket.on('sit', (color, user) => dispatch(updatePlayer(color, user)));
  socket.on('board.move', (from, to) => dispatch(updateBoardWithMove(from, to)));
}
