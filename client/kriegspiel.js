import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';
import Square from './square';
import Piece from './piece';
import Board from '../lib/board.coffee';

class Kriegspiel extends React.Component {
  constructor() {
    super();
    this.state = {board: new Board()};
  }
  renderPiece(x, y) {
    let pieceType = this.state.board.pieceType(x, y);
    if (pieceType) {
      return <Piece pieceType={pieceType} x={x} y={y} color={this.state.board.color(x, y)} canDrag={this.canMove.bind(this)} />
    }
  }
  canMove(color) {
    return color === this.state.board.turn;
  }
  canDrop(origCoords, newCoords) {
    return this.state.board.canMove(origCoords.x, origCoords.y, newCoords.x, newCoords.y);
  }
  drop(origCoords, newCoords) {
    this.state.board.move(origCoords.x, origCoords.y, newCoords.x, newCoords.y);
    this.setState({board: this.state.board});
  }
  render() {
    return <div className="board">
      {[7,6,5,4,3,2,1,0].map((y) =>
        [0,1,2,3,4,5,6,7].map((x) =>
          <Square x={x} y={y} canDrop={this.canDrop.bind(this)} drop={this.drop.bind(this)}>
            {this.renderPiece(x, y)}
          </Square>
        )
      )}
    </div>
  }
}

export default DragDropContext(HTML5Backend)(Kriegspiel);
