import React, {PropTypes} from 'react';
// import {Pawn, Knight, Bishop, Rook, Queen, King} from './piece';
// import Piece from './piece';
import { DropTarget } from 'react-dnd';

const squareTarget = {
  canDrop(props, monitor) {
    return props.canDrop(monitor.getItem(), {x: props.x, y: props.y});
  },
  drop(props, monitor) {
    props.drop(monitor.getItem(), {x: props.x, y: props.y});
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
}

class Square {
  // piece() {
  //   var isWhite = this.props.color > 0;
  //   switch (this.props.pieceType) {
  //     case 1: // PAWN
  //       return <Pawn color={this.props.color} />;
  //     case 2: // KNIGHT
  //       return <Knight color={this.props.color} />;
  //     case 3: // BISHOP
  //       return <Bishop color={this.props.color} />;
  //     case 4: // ROOK
  //       return <Rook color={this.props.color} />;
  //     case 5: // QUEEN
  //       return <Queen color={this.props.color} />;
  //     case 6: // KING
  //       return <King color={this.props.color} />;
  //   }
  // }
  // piece() {
  //   if (this.props.pieceType !== 0) {
  //     return <Piece pieceType={this.props.pieceType} color={this.props.color} />;
  //   }
  // }
  character() {
    var isWhite = this.props.color > 0;
    switch (this.props.pieceType) {
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
  render() {
    const { x, y, connectDropTarget, isOver, canDrop } = this.props;
    return connectDropTarget(<div>
       {this.props.children}
    </div>);
  }
}

Square.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired
};

export default DropTarget('piece', squareTarget, collect)(Square);