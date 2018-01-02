import { createStore } from 'redux';
import * as cookieMonster from '../../client/cookie-monster';
import * as board from '../../lib/board.coffee';
import {
  SET_USER,
  UPDATE_PLAYER,
  UPDATE_BOARD,
  GAME_EVENT,
  setUser,
  sitAs,
  standAs,
  updateBoard,
  move,
  updateBoardWithMove,
} from '../../client/actions';

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
    class FakeBoard {
      constructor(fields) {
        this.args = {};
        this.moves = [];
        this._gameState = Object.assign({}, fields.gameState);
        for (const field in fields) { this.args[field] = fields[field]; }
      }
      gameState() { return this._gameState; }
      move(...args) {
        this.moves.push(args);
        this._gameState.turn *= -1;
        if (this.shouldCall.onCheck && this.args.onCheck) { this.args.onCheck(); }
        if (this.shouldCall.onMate && this.args.onMate) { this.args.onMate(); }
      }
    }
    function createFakeBoardWrapper() {
      let instance;
      const shouldCall = { onCheck: false, onMate: false };
      return {
        newFake(...args) {
          instance = new FakeBoard(...args);
          instance.shouldCall = shouldCall;
          return instance;
        },
        force(callbackName) { shouldCall[callbackName] = true; },
        instance: () => instance,
      };
    }
    let boardFaker;
    beforeEach(() => {
      boardFaker = createFakeBoardWrapper();
      spyOn(board, 'default').and.callFake(boardFaker.newFake);
    });
    it('updates the board state with the given move', () => {
      const state = { game: { board: { turn: 1 } } };
      const action = updateBoardWithMove({ x: 0, y: 1 }, { x: 2, y: 3 })(dispatchSpy, () => state);

      const board = boardFaker.instance();
      expect(board.moves).toEqual([[0, 1, 2, 3]]);
      expect(dispatchSpy).toHaveBeenCalledWith({ type: UPDATE_BOARD, board: { turn: -1 } });
    });
    it('updates the game state when the given move results in check after updating the board', () => {
      boardFaker.force('onCheck');
      const state = { game: { board: { turn: 1 } } };
      const action = updateBoardWithMove({ x: 0, y: 1 }, { x: 2, y: 3 })(dispatchSpy, () => state);

      expect(dispatchSpy.calls.argsFor(0)).toEqual([jasmine.objectContaining({ type: UPDATE_BOARD })]);
      expect(dispatchSpy.calls.argsFor(1)).toEqual([{ type: GAME_EVENT, name: 'check' }]);
    });
    it('updates the game state when the given move results in mate after updating the board', () => {
      boardFaker.force('onMate');
      const state = { game: { board: { turn: 1 } } };
      const action = updateBoardWithMove({ x: 0, y: 1 }, { x: 2, y: 3 })(dispatchSpy, () => state);

      expect(dispatchSpy.calls.argsFor(0)).toEqual([jasmine.objectContaining({ type: UPDATE_BOARD })]);
      expect(dispatchSpy.calls.argsFor(1)).toEqual([{ type: GAME_EVENT, name: 'mate' }]);
    });
  });
});
