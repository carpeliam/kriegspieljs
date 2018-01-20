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

function defaultState() {
  let state = {
    user: { id: 1 },
    game: {
      players: {},
      board: { squares: [[3]], turn: 1, inProgress: false },
    }
  };
  return {
    build: () => state,
    inProgress() {
      state.game.board.inProgress = true;
      return this;
    },
    withWhite() {
      state.game.players.white = { id: 1 };
      return this;
    },
    withBlack() {
      state.game.players.black = { id: 2 };
      return this;
    }
  };
}

describe('Square', () => {
  const SquareContext = wrapInTestContext(Square);

  it('renders the Piece for the given square', () => {
    const initialState = defaultState().build();
    const store = createStore(state => state, initialState);
    spyOn(Board.prototype, 'loadState');
    spyOn(Board.prototype, 'pieceType').and.returnValue(3);
    spyOn(Board.prototype, 'color').and.returnValue(-1);
    const container = mount(<SquareContext store={store} x={0} y={0} />);
    expect(Board.prototype.loadState).toHaveBeenCalledWith(initialState.game.board);
    expect(Board.prototype.pieceType).toHaveBeenCalledWith(0, 0);
    expect(Board.prototype.color).toHaveBeenCalledWith(0, 0);
    const piece = container.find(Piece);
    expect(piece).toHaveProp('type', 3);
    expect(piece).toHaveProp('x', 0);
    expect(piece).toHaveProp('y', 0);
    expect(piece).toHaveProp('color', -1);
  });

  it('allows the Piece to drag if the current user is the active player', () => {
    const store = createStore(state => state, defaultState().withWhite().withBlack().build());
    const container = mount(<SquareContext store={store} x={0} y={0} />);
    const piece = container.find(Piece);
    expect(piece).toHaveProp('canDrag', true);
  });

  it('does not allow the Piece to drag if there is no active player', () => {
    const store = createStore(state => state, defaultState().build());
    const container = mount(<SquareContext store={store} x={0} y={0} />);
    const piece = container.find(Piece);
    expect(piece).toHaveProp('canDrag', false);
  });

  it('does not render a Piece if the given square is empty', () => {
    const store = createStore(state => state, defaultState().build());
    spyOn(Board.prototype, 'pieceType').and.returnValue(undefined);
    spyOn(Board.prototype, 'color').and.returnValue(undefined);
    const container = mount(<SquareContext store={store} x={1} y={1} />);
    expect(container.find(Piece)).toBeEmpty();
  });

  it('does not render a Piece if the game is in progress and the current user is seated with the opposite color', () => {
    const initialState = defaultState().inProgress().withWhite().build();
    const store = createStore(state => state, initialState);
    spyOn(Board.prototype, 'pieceType').and.returnValue(3);
    spyOn(Board.prototype, 'color').and.returnValue(-1);
    const container = mount(<SquareContext store={store} x={0} y={0} />);
    expect(container.find(Piece)).toBeEmpty();
  });

  it('asks the Board if dropping a piece makes a legal move', () => {
    const initialState = defaultState().withWhite().withBlack().build();
    const store = createStore(state => state, initialState);
    spyOn(store, 'dispatch');
    spyOn(Board.prototype, 'pieceType').and.returnValue(3);
    spyOn(Board.prototype, 'canMove').and.returnValue(true);
    spyOn(Board.prototype, 'color').and.returnValue(initialState.game.board.turn);
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
