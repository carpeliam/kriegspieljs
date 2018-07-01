import React from 'react';
import { connect } from 'react-redux';
import { DragLayer } from 'react-dnd';

import Game from '../lib/game';
import { character, Piece, PIECE_SIZE } from './piece';

function snapToGrid(x, y) {
  return [Math.round(x / PIECE_SIZE) * PIECE_SIZE, Math.round(y / PIECE_SIZE) * PIECE_SIZE];
}

function getItemStyles(initialOffset, currentOffset) {
  if (!currentOffset) {
    return { display: 'none' };
  }
  let { x, y } = currentOffset;
  x -= initialOffset.x;
  y -= initialOffset.y;
  [x, y] = snapToGrid(x, y);
  x += initialOffset.x;
  y += initialOffset.y;
  return {
    transform: `translate(${x}px, ${y}px)`,
  };
}

function SnapLayer({ type, color, isDragging, initialOffset, currentOffset }) {
  if (!isDragging) {
    return null;
  }
  return (
    <aside className="snap-overlay">
      <div style={getItemStyles(initialOffset, currentOffset)}>
        <Piece type={type} color={color} />
      </div>
    </aside>
  );
}

function mapStateToProps({ game: { board } }, { item }) {
  if (item) {
    const { x, y } = item;
    const game = new Game({ gameState: board });
    return { type: game.pieceType(x, y), color: game.color(x, y) };
  }
  return {};
}
const SnapLayerContainer = connect(mapStateToProps)(SnapLayer);

export default DragLayer(monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging(),
}))(SnapLayerContainer);
