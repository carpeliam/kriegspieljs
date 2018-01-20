import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import BoardContainer, { BoardDragDropContext } from '../../client/board';
import Square from '../../client/square';

const Board = BoardDragDropContext.DecoratedComponent;

describe('Board', () => {
  it('renders 64 squares', () => {
    const board = shallow(<Board observingColor="white" />);
    const squares = board.find(Square);
    expect(squares.length).toEqual(64);
  });

  describe('when the current user is either playing as white or not playing', () => {
    it('shows the A8 square at the top left of the board', () => {
      const board = shallow(<Board observingColor="white" />);
      const squares = board.find(Square);
      expect(board.find('.board__label--file').at(0)).toHaveText('a');
      expect(board.find('.board__label--rank').at(0)).toHaveText('8');
      expect(squares.at(0)).toHaveProp('x', 0);
      expect(squares.at(0)).toHaveProp('y', 7);
      expect(squares.at(63)).toHaveProp('x', 7);
      expect(squares.at(63)).toHaveProp('y', 0);
    });
  });

  describe('when the current user is playing as black', () => {
    it('shows the H1 square at the top left of the board', () => {
      const board = shallow(<Board observingColor="black" />);
      const squares = board.find(Square);
      expect(board.find('.board__label--file').at(0)).toHaveText('h');
      expect(board.find('.board__label--rank').at(0)).toHaveText('1');
      expect(squares.at(0)).toHaveProp('x', 7);
      expect(squares.at(0)).toHaveProp('y', 0);
      expect(squares.at(63)).toHaveProp('x', 0);
      expect(squares.at(63)).toHaveProp('y', 7);
    });
  });
});

describe('Board container', () => {
  let container;
  let store;
  const players = {
    white: { id: 'abc123', name: 'Bobby' },
    black: { id: '123abc', name: 'Gary' },
  };
  it('passes the observing color as white if white is the current user', () => {
    store = createStore(state => state, { user: players.white, game: { players } });
    container = shallow(<BoardContainer store={store} />);
    expect(container.find(BoardDragDropContext)).toHaveProp('observingColor', 'white');
  });
  it('passes the observing color as black if black is the current user', () => {
    store = createStore(state => state, { user: players.black, game: { players } });
    container = shallow(<BoardContainer store={store} />);
    expect(container.find(BoardDragDropContext)).toHaveProp('observingColor', 'black');
  });
  it('does not pass an observing color if the current user is not playing', () => {
    store = createStore(state => state, { user: { id: 'guest' }, game: { players } });
    container = shallow(<BoardContainer store={store} />);
    expect(container.find(BoardDragDropContext)).toHaveProp('observingColor', 'white');
  });
});
