import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import Piece from './piece';
import Game from '../lib/game';
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
    const { connectDropTarget, piece } = this.props;
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

function mapStateToProps({ user, game: { board, players } }, { x, y }) {
  const game = new Game({ gameState: board });
  let activePlayer;
  if (players.white && players.black) {
    activePlayer = (board.turn === 1) ? players.white : players.black;
  }
  const type = game.pieceType(x, y);
  const color = game.color(x, y);
  const opposingPieceOwner = players[(color === 1) ? 'black' : 'white'];
  const userIsOpposingPieceOwner = !!opposingPieceOwner && opposingPieceOwner.id === user.id;
  const canDrag = !!activePlayer && activePlayer.id === user.id;
  const piece = type && !(board.inProgress && userIsOpposingPieceOwner) && { type, color, x, y, canDrag };
  return {
    piece,
    canDrop: (origCoords, newCoords) => game.canMove(origCoords.x, origCoords.y, newCoords.x, newCoords.y),
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
