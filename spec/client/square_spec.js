import React from 'react';
import { createStore } from 'redux';
import { shallow, mount } from 'enzyme';
import { DragDropContext } from 'react-dnd';
import TestBackend from 'react-dnd-test-backend';
import Square, { SquareTarget } from '../../client/square';
import Piece from '../../client/piece';
import Board from '../../lib/board.coffee';
import * as actions from '../../client/actions';

function wrapInTestContext(DecoratedComponent) {
  return DragDropContext(TestBackend)(props => <DecoratedComponent {...props} />);
}

describe('Square', () => {
  const SquareContext = wrapInTestContext(Square);
  let store;
  beforeEach(() => {
    store = createStore(state => state, {
      user: { id: 1 },
      game: {
        players: { black: { id: 1 }, white: { id: 2 } },
        board: { squares: [[-3]], turn: -1 },
      },
    });
    spyOn(store, 'dispatch');
    spyOn(Board.prototype, 'color').and.returnValue(-1);
  });

  it('renders the Piece for the given square', () => {
    spyOn(Board.prototype, 'loadState');
    spyOn(Board.prototype, 'pieceType').and.returnValue(3);
    const container = mount(<SquareContext store={store} x={0} y={0} />);
    expect(Board.prototype.loadState).toHaveBeenCalledWith({ squares: [[-3]], turn: -1 });
    expect(Board.prototype.pieceType).toHaveBeenCalledWith(0, 0);
    expect(Board.prototype.color).toHaveBeenCalledWith(0, 0);
    const piece = container.find(Piece);
    expect(piece).toHaveProp('type', 3);
    expect(piece).toHaveProp('x', 0);
    expect(piece).toHaveProp('y', 0);
    expect(piece).toHaveProp('color', -1);
  });

  it('allows the Piece to drag if the current user is the active player', () => {
    const container = mount(<SquareContext store={store} x={0} y={0} />);
    const piece = container.find(Piece);
    expect(piece).toHaveProp('canDrag', true);
  });

  it('does not allow the Piece to drag if the current user is not the active player', () => {
    store = createStore(state => state, {
      user: { id: 1 },
      game: {
        players: { black: { id: 1 }, white: { id: 2 } },
        board: { squares: [[-3]], turn: 1 },
      },
    });
    const container = mount(<SquareContext store={store} x={0} y={0} />);
    const piece = container.find(Piece);
    expect(piece).toHaveProp('canDrag', false);
  });

  it('does not allow the Piece to drag if there is no active player', () => {
    store = createStore(state => state, {
      user: { id: 1 },
      game: {
        players: { white: { id: 2 } },
        board: { squares: [[3]], turn: 1 },
      },
    });
    const container = mount(<SquareContext store={store} x={0} y={0} />);
    const piece = container.find(Piece);
    expect(piece).toHaveProp('canDrag', false);
  });

  it('does not render a Piece if the given square is empty', () => {
    spyOn(Board.prototype, 'pieceType').and.returnValue(undefined);
    const container = mount(<SquareContext store={store} x={1} y={1} />);
    expect(container.find(Piece)).toBeEmpty();
  });

  it('asks the Board if dropping a piece makes a legal move', () => {
    spyOn(Board.prototype, 'pieceType').and.returnValue(3);
    spyOn(Board.prototype, 'canMove').and.returnValue(true);
    spyOn(actions, 'move').and.returnValue({ type: 'move' });
    const container = mount(
      <div>
        <SquareContext store={store} x={0} y={1} />
        <SquareContext store={store} x={2} y={3} />
      </div>
    );
    const backend = container.children().get(0).getManager().getBackend();

    const piece = container.find(SquareContext).at(0).find(Piece).get(0);
    const target = container.find(SquareTarget).get(1);
    backend.simulateBeginDrag([piece.getHandlerId()]);
    backend.simulateHover([target.getHandlerId()]);
    backend.simulateDrop();
    expect(Board.prototype.canMove).toHaveBeenCalledWith(0, 1, 2, 3);
    backend.simulateEndDrag();
    expect(actions.move).toHaveBeenCalledWith({ x: 0, y: 1 }, { x: 2, y: 3 });
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'move' });
  });
});
