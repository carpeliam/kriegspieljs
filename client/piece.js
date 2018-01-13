import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';

export function character(props) {
  let { type, color } = props;
  let isWhite = color > 0;
  switch (type) {
    case 1: // PAWN
      return isWhite ? '♙' : '♟';
    case 2: // KNIGHT
      return isWhite ? '♘' : '♞';
    case 3: // BISHOP
      return isWhite ? '♗' : '♝';
    case 4: // ROOK
      return isWhite ? '♖' : '♜';
    case 5: // QUEEN
      return isWhite ? '♕' : '♛';
    case 6: // KING
      return isWhite ? '♔' : '♚';
  }
}

const spec = {
  beginDrag(props) {
    return {x: props.x, y: props.y};
  },
  canDrag(props) {
    return props.canDrag;
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

class Piece extends React.Component {
  render() {
    const { connectDragSource, isDragging } = this.props;
    return connectDragSource(
      <span style={{opacity: isDragging ? 0.5 : 1}}>{character(this.props)}</span>
    );
  }
}

export default DragSource('piece', spec, collect)(Piece);

Piece.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired
};
