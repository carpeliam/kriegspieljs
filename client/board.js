import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Square from './square';

export function Board(props) {
  return (
    <div className="board">
      {[7, 6, 5, 4, 3, 2, 1, 0].map((y) =>
        [0, 1, 2, 3, 4, 5, 6, 7].map((x) =>
          <Square x={x} y={y} />
        )
      )}
    </div>
  );
}

export default DragDropContext(HTML5Backend)(Board);
