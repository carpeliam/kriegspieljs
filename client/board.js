import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Square from './square';

const ascending = [0, 1, 2, 3, 4, 5, 6, 7];
const descending = [7, 6, 5, 4, 3, 2, 1, 0];
const fileLabels = 'abcdefgh';
function Board({ observingColor }) {
  const ranks = (observingColor === 'black') ? ascending : descending;
  const files = (observingColor === 'black') ? descending : ascending;
  return (
    <div className="board">
      <header>
        {files.map(file => <span key={`file${file}`} className="board__label board__label--file">{fileLabels[file]}</span>)}
      </header>
      {ranks.map(rank => (
        [
          <span key={`rank${rank}l`} className="board__label board__label--rank">{rank + 1}</span>,
          ...files.map(file => <Square x={file} y={rank} />),
          <span key={`rank${rank}r`} className="board__label board__label--rank">{rank + 1}</span>
        ]
      ))}
      <footer>
        {files.map(file => <span key={`file${file}`} className="board__label board__label--file">{fileLabels[file]}</span>)}
      </footer>
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
