import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import Piece from './piece';
import Board from '../lib/board.coffee';
import { move } from './actions';

const squareTarget = {
  canDrop({ canDrop, x, y }, monitor) {
    return canDrop(monitor.getItem(), { x, y });
  },
  drop({ drop, x, y }, monitor) {
    drop(monitor.getItem(), { x, y });
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
}

export class Square extends React.Component {
  render() {
    const { x, y, connectDropTarget, isOver, canDrop, piece } = this.props;
    return connectDropTarget(
      <div>
        {piece && <Piece {...piece} />}
      </div>
    );
  }
}

Square.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired
};

export const SquareTarget = DropTarget('piece', squareTarget, collect)(Square);

function mapStateToProps({ user, game }, { x, y }) {
  const board = new Board({ gameState: game.board });
  let activePlayer;
  if (game.players.white && game.players.black) {
    activePlayer = (game.board.turn === 1) ? game.players.white : game.players.black;
  }
  const type = board.pieceType(x, y);
  const canDrag = (!!activePlayer && activePlayer.id === user.id);
  const piece = type && {
    type,
    color: board.color(x, y),
    x,
    y,
    canDrag
  };
  return {
    piece,
    canDrop: (origCoords, newCoords) => board.canMove(origCoords.x, origCoords.y, newCoords.x, newCoords.y)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    drop(origCoords, newCoords) {
      dispatch(move(origCoords, newCoords));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SquareTarget);
