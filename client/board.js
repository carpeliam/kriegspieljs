import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Square from './square';

const ascending = [0, 1, 2, 3, 4, 5, 6, 7];
const descending = [7, 6, 5, 4, 3, 2, 1, 0];
function Board({ observingColor }) {
  const rows = (observingColor === 'black') ? ascending : descending;
  const cols = (observingColor === 'black') ? descending : ascending;
  return (
    <div className="board">
      {rows.map(y => cols.map(x => <Square x={x} y={y} />))}
    </div>
  );
}

Board.propTypes = {
  observingColor: PropTypes.oneOf(['white', 'black']).isRequired,
};

export const BoardDragDropContext = DragDropContext(HTML5Backend)(Board);

function mapStateToProps({ user, game: { players } }) {
  const observingColor = (players.black && players.black.id === user.id) ? 'black' : 'white';
  return { observingColor };
}

export default connect(mapStateToProps)(BoardDragDropContext);
