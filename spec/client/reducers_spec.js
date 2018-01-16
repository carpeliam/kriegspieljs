import {
  SET_USER,
  UPDATE_PLAYER,
  UPDATE_BOARD,
  RESET_GAME,
  GAME_EVENT,
  UPDATE_MEMBERS,
  ADD_MESSAGE,
  RESIGN_PLAYER,
} from '../../client/actions';
import { user, game, members, messages } from '../../client/reducers';
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
    expect(game(undefined, { type: 'SOME_ACTION' })).toEqual({ players: {}, board, check: false, mate: false, pawnAdvance: undefined });
  });
  it('updates the players upon an UPDATE_PLAYER action', () => {
    const initialState = { players: { black: { id: 2, resigned: false } }, board: { turn: 1 } };
    const updatePlayerAction = { type: UPDATE_PLAYER, color: 'white', user: { id: 1 } };
    const state = game(initialState, updatePlayerAction);
    expect(state).toEqual({ players: { white: { id: 1, resigned: false }, black: { id: 2, resigned: false } }, board: { turn: 1 } });
  });
  it('updates a player and game state upon a RESIGN_PLAYER action', () => {
    const initialState = { players: { black: { id: 2, resigned: false } }, board: { inProgress: true } };
    const resignPlayerAction = { type: RESIGN_PLAYER, color: 'black', board: { inProgress: false } };
    const state = game(initialState, resignPlayerAction);
    expect(state).toEqual({ players: { black: { id: 2, resigned: true } }, board: { inProgress: false } });
  });
  it('updates the board upon an UPDATE_BOARD action', () => {
    const initialState = { players: { black: { id: 2 } }, board: { turn: 1 }, check: false, mate: false, pawnAdvance: undefined };
    const updateBoardAction = { type: UPDATE_BOARD, board: { turn: 2 } };
    const state = game(initialState, updateBoardAction);
    expect(state).toEqual({ players: { black: { id: 2 } }, board: { turn: 2 }, check: false, mate: false, pawnAdvance: undefined });
  });
  it('resets the game upon a RESET_GAME action', () => {
    const expectedInitialState = game(undefined, { type: 'ANY_ACTION' });
    const newGameState = game({}, { type: RESET_GAME, board: { turn: 1 } });
    expect(newGameState).toEqual(Object.assign({}, expectedInitialState, { board: { turn: 1 } }));
  });
  it('processes check and mate game events', () => {
    const checkState = game({ check: false, mate: false }, { type: GAME_EVENT, name: 'check' });
    expect(checkState).toEqual({ check: true, mate: false});
    const mateState = game({ check: false, mate: false }, { type: GAME_EVENT, name: 'mate' });
    expect(mateState).toEqual({ check: false, mate: true});
  });
  it('processes pawn advancement game events', () => {
    const advanceState = game({}, { type: GAME_EVENT, name: 'pawnAdvance', square: { x: 1, y: 2 } });
    expect(advanceState).toEqual({ pawnAdvance: { x: 1, y: 2 } });
  });
  it('resets check and pawnAdvance game event upon subsequent board updates', () => {
    const initialState = { players: { black: { id: 2 } }, board: { turn: 1 }, check: true, mate: false, pawnAdvance: { x: 0, y: 0 } };
    const updateBoardAction = { type: UPDATE_BOARD, board: { turn: 2 } };
    const state = game(initialState, updateBoardAction);
    expect(state).toEqual({ players: { black: { id: 2 } }, board: { turn: 2 }, check: false, mate: false, pawnAdvance: undefined });
  });
});

describe('members', () => {
  it('has no members by default', () => {
    expect(members(undefined, { type: 'SOME ACTION' })).toEqual([]);
  });
  it('processes UPDATE_MEMBERS actions', () => {
    const newMembers = [{ id: 'abc123' }];
    expect(members([], { type: UPDATE_MEMBERS, members: newMembers })).toEqual(newMembers);
  });
});

describe('messages', () => {
  it('has no messages by default', () => {
    expect(messages(undefined, { type: 'SOME ACTION' })).toEqual([]);
  });
  it('adds new messages to the end of the list', () => {
    const newMessage = { type: ADD_MESSAGE, message: { message: 'second one' } };
    expect(messages([{ message: 'first one' }], newMessage)).toEqual([
      { message: 'first one' },
      { message: 'second one' },
    ]);
  });
  it('adds game events to the message log', () => {
    expect(messages([], { type: GAME_EVENT, name: 'check' })).toEqual([{ message: 'Check!', type: 'check' }]);
    expect(messages([], { type: GAME_EVENT, name: 'mate' })).toEqual([{ message: 'Checkmate.', type: 'mate' }]);
  });
});
