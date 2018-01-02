import { createStore } from 'redux';
import * as cookieMonster from '../../client/cookie-monster';
import {
  SET_USER,
  UPDATE_PLAYER,
  UPDATE_BOARD,
  setUser,
  sitAs,
  standAs,
  updateBoard,
  move,
  updateBoardWithMove,
} from '../../client/actions';
import Board from '../../lib/board.coffee';

describe('actions', () => {
  let dispatchSpy;
  let socketSpy;
  beforeEach(() => {
    dispatchSpy = jasmine.createSpy('dispatch');
    socketSpy = jasmine.createSpyObj('socket', ['emit']);
  });
  describe('setUser', () => {
    beforeEach(() => {
      spyOn(cookieMonster, 'fetchUser').and.returnValue({ id: 'abc123' });
      spyOn(cookieMonster, 'setUser');
    });
    it('sets the user name and saves a cookie', () => {
      const user = { id: 'abc123', name: 'margaret' };
      setUser('margaret')(dispatchSpy, undefined, socketSpy);
      expect(cookieMonster.setUser).toHaveBeenCalledWith(user);
      expect(dispatchSpy).toHaveBeenCalledWith({ type: SET_USER, user });
      expect(socketSpy.emit).toHaveBeenCalledWith('nickname.set', 'margaret');
    });
  });

  describe('sitAs', () => {
    it('updates the game with the given player sitting in the given color', () => {
      sitAs('white', { id: 'abc123' })(dispatchSpy, undefined, socketSpy);
      expect(dispatchSpy).toHaveBeenCalledWith({ type: UPDATE_PLAYER, user: { id: 'abc123' }, color: 'white' });
      expect(socketSpy.emit).toHaveBeenCalledWith('sit', 'white');
    });
  });

  describe('standAs', () => {
    it('updates the game with an undefined player in the given color', () => {
      const action = standAs('white');
      expect(action).toEqual({ type: UPDATE_PLAYER, user: undefined, color: 'white' });
    });
  });

  describe('updateGameState', () => {
    it('updates the state of the board', () => {
      const action = updateBoard({ turn: 1 });
      expect(action).toEqual({ type: UPDATE_BOARD, board: { turn: 1 } });
    });
  });

  describe('move', () => {
    it('sends the move to other clients', () => {
      const action = move({ x: 0, y: 1 }, { x: 2, y: 3 })(dispatchSpy, undefined, socketSpy);
      expect(socketSpy.emit).toHaveBeenCalledWith('board.move', { x: 0, y: 1 }, { x: 2, y: 3 });
    });
  });
  describe('updateBoardWithMove', () => {
    it('updates the board state with the given move', () => {
      spyOn(Board.prototype, 'loadState');
      spyOn(Board.prototype, 'move');
      spyOn(Board.prototype, 'gameState').and.returnValue({ turn: -1 });
      const state = { game: { board: { turn: 1 } } };
      const action = updateBoardWithMove({ x: 0, y: 1 }, { x: 2, y: 3 })(dispatchSpy, () => state);
      expect(Board.prototype.loadState).toHaveBeenCalledWith({ turn: 1 });
      expect(Board.prototype.move).toHaveBeenCalledWith(0, 1, 2, 3);
      expect(dispatchSpy).toHaveBeenCalledWith({ type: UPDATE_BOARD, board: { turn: -1 } });
    });
  });
});
