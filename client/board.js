import React from 'react';
import Square from './square';

export default function Board(props) {
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
