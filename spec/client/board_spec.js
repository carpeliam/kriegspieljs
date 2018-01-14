import React from 'react';
import { shallow } from 'enzyme';
import BoardDragDropContext from '../../client/board';
import Square from '../../client/square';

const Board = BoardDragDropContext.DecoratedComponent;

describe('Board', () => {
  it('renders 64 squares', () => {
    const board = shallow(<Board />);
    const squares = board.find(Square);
    expect(squares.length).toEqual(64);
    expect(squares.at(0)).toHaveProp('x', 0);
    expect(squares.at(0)).toHaveProp('y', 7);
    expect(squares.at(63)).toHaveProp('x', 7);
    expect(squares.at(63)).toHaveProp('y', 0);
  });
});
