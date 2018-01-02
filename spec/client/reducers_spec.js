import { SET_USER, UPDATE_PLAYER, UPDATE_BOARD } from '../../client/actions';
import { user, game } from '../../client/reducers';
import Board from '../../lib/board.coffee';

describe('user reducer', () => {
  it('has a default state of null', () => {
    expect(user(undefined, { type: 'SOME_ACTION' })).toBeNull();
  });
  it('sets the user upon receiving a SET_USER action', () => {
    const currentUser = { id: 'abc123', name: 'margaret' };
    expect(user(undefined, { type: SET_USER, user: currentUser })).toEqual(currentUser);
  });
});

describe('game reducer', () => {
  it('has a default state with empty player info and default game state', () => {
    const board = new Board().gameState();
    expect(game(undefined, { type: 'SOME_ACTION' })).toEqual({ players: {}, board });
  });
  it('updates the players upon an UPDATE_PLAYER action', () => {
    const initialState = { players: { black: { id: 2 } }, board: { turn: 1 } };
    const updatePlayerAction = { type: UPDATE_PLAYER, color: 'white', user: { id: 1 } };
    const state = game(initialState, updatePlayerAction);
    expect(state).toEqual({ players: { white: { id: 1 }, black: { id: 2 } }, board: { turn: 1 } });
  });
  it('updates the board upon an UPDATE_BOARD action', () => {
    const initialState = { players: { black: { id: 2 } }, board: { turn: 1 } };
    const updateBoardAction = { type: UPDATE_BOARD, board: { turn: 2 } };
    const state = game(initialState, updateBoardAction);
    expect(state).toEqual({ players: {black: { id: 2 } }, board: { turn: 2 } });
  });
});
