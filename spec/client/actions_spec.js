import { createStore } from 'redux';
import * as cookieMonster from '../../client/cookie-monster';
import * as board from '../../lib/board.coffee';
import {
  SET_USER,
  UPDATE_PLAYER,
  UPDATE_BOARD,
  GAME_EVENT,
  UPDATE_MEMBERS,
  ADD_MESSAGE,
  setUser,
  updatePlayer,
  sitAs,
  stand,
  updateBoard,
  move,
  updateBoardWithMove,
  updateMembers,
  sendMessage,
  processMessage,
  processAnnouncement,
  onPromotionSelection,
  updateBoardWithPromotion,
} from '../../client/actions';

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
    if (this.shouldCall.onCheck) { this.args.onCheck(); }
    if (this.shouldCall.onMate) { this.args.onMate(); }
    if (this.shouldCall.onAdvancement) { this.args.onAdvancement(1, 2); }
  }
  promote(square, newPieceValue) {
    this.promotion = { square, newPieceValue };
    this._gameState.turn *= -1;
    if (this.shouldCall.onCheck) { this.args.onCheck(); }
    if (this.shouldCall.onMate) { this.args.onMate(); }
  }
  pawnCaptures() { return { e5: ['c5', 'd6'] }; }
}
function createFakeBoardWrapper() {
  let instance;
  const shouldCall = { onCheck: false, onMate: false, onAdvancement: false };
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
      expect(socketSpy.emit).toHaveBeenCalledWith('sit', 'white');
    });
  });

  describe('stand', () => {
    it('updates the game with an undefined player in the given color', () => {
      stand()(dispatchSpy, undefined, socketSpy);
      expect(socketSpy.emit).toHaveBeenCalledWith('stand');
    });
  });

  describe('updatePlayer', () => {
    it('dispatches an update to that player color', () => {
      updatePlayer('white', { id: 'abc123', name: 'Bobby' })(dispatchSpy);
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: UPDATE_PLAYER,
        color: 'white',
        user: { id: 'abc123', name: 'Bobby' },
      });
    });
    it('posts an announcement if a player has sat or stood up', () => {
      updatePlayer('white', { id: 'abc123', name: 'Bobby' })(dispatchSpy);
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: ADD_MESSAGE,
        message: { message: 'Bobby sat down as white', type: 'event' },
      });
      updatePlayer('white', undefined)(dispatchSpy);
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: ADD_MESSAGE,
        message: { message: 'white stood up', type: 'event' },
      });
    });
  });

  describe('updateBoard', () => {
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
    let boardFaker;
    beforeEach(() => {
      boardFaker = createFakeBoardWrapper();
      spyOn(board, 'default').and.callFake(boardFaker.newFake);
    });
    it('updates the board state with the given move', () => {
      const state = { game: { board: { turn: 1 } } };
      updateBoardWithMove({ x: 0, y: 1 }, { x: 2, y: 3 })(dispatchSpy, () => state);

      const board = boardFaker.instance();
      expect(board.moves).toEqual([[0, 1, 2, 3]]);
      expect(dispatchSpy).toHaveBeenCalledWith({ type: UPDATE_BOARD, board: { turn: -1 } });
    });
    it('updates the game state when the given move results in check after updating the board', () => {
      boardFaker.force('onCheck');
      const state = { game: { board: { turn: 1 } } };
      updateBoardWithMove({ x: 0, y: 1 }, { x: 2, y: 3 })(dispatchSpy, () => state);

      expect(dispatchSpy.calls.argsFor(0)).toEqual([jasmine.objectContaining({ type: UPDATE_BOARD })]);
      expect(dispatchSpy.calls.argsFor(1)).toEqual([{ type: GAME_EVENT, name: 'check' }]);
    });
    it('updates the game state when the given move results in mate after updating the board', () => {
      boardFaker.force('onMate');
      const state = { game: { board: { turn: 1 } } };
      updateBoardWithMove({ x: 0, y: 1 }, { x: 2, y: 3 })(dispatchSpy, () => state);

      expect(dispatchSpy.calls.argsFor(0)).toEqual([jasmine.objectContaining({ type: UPDATE_BOARD })]);
      expect(dispatchSpy.calls.argsFor(1)).toEqual([{ type: GAME_EVENT, name: 'mate' }]);
    });
    it('updates the game state when the given move results in pawn advancement', () => {
      boardFaker.force('onAdvancement');
      const state = { game: { board: { turn: 1 } } };
      updateBoardWithMove({ x: 0, y: 1 }, { x: 2, y: 3 })(dispatchSpy, () => state);

      expect(dispatchSpy.calls.argsFor(0)).toEqual([jasmine.objectContaining({ type: UPDATE_BOARD })]);
      expect(dispatchSpy.calls.argsFor(1)).toEqual([{ type: GAME_EVENT, name: 'pawnAdvance', square: { x: 1, y: 2 } }]);
    });
    it('dispatches announcements when pawn captures are available', () => {
      const state = { game: { board: { turn: 1 } } };
      updateBoardWithMove({ x: 0, y: 1 }, { x: 2, y: 3 })(dispatchSpy, () => state);
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: ADD_MESSAGE,
        message: { type: 'event', message: 'The pawn on e5 can make a capture.' },
      });
    });
  });

  describe('updateBoardWithPromotion', () => {
    let boardFaker;
    beforeEach(() => {
      boardFaker = createFakeBoardWrapper();
      spyOn(board, 'default').and.callFake(boardFaker.newFake);
    });
    it('updates the board state with the given promotion', () => {
      const state = { game: { board: { turn: 1 } } };
      updateBoardWithPromotion({ x: 0, y: 1 }, 5)(dispatchSpy, () => state);

      const board = boardFaker.instance();
      expect(board.promotion).toEqual({ square: { x: 0, y: 1 }, newPieceValue: 5 });
      expect(dispatchSpy).toHaveBeenCalledWith({ type: UPDATE_BOARD, board: { turn: -1 } });
    });
    it('updates the game state when the given move results in check after updating the board', () => {
      boardFaker.force('onCheck');
      const state = { game: { board: { turn: 1 } } };
      updateBoardWithPromotion({ x: 0, y: 1 }, 5)(dispatchSpy, () => state);

      expect(dispatchSpy.calls.argsFor(0)).toEqual([jasmine.objectContaining({ type: UPDATE_BOARD })]);
      expect(dispatchSpy.calls.argsFor(1)).toEqual([{ type: GAME_EVENT, name: 'check' }]);
    });
    it('updates the game state when the given move results in mate after updating the board', () => {
      boardFaker.force('onMate');
      const state = { game: { board: { turn: 1 } } };
      updateBoardWithPromotion({ x: 0, y: 1 }, 5)(dispatchSpy, () => state);

      expect(dispatchSpy.calls.argsFor(0)).toEqual([jasmine.objectContaining({ type: UPDATE_BOARD })]);
      expect(dispatchSpy.calls.argsFor(1)).toEqual([{ type: GAME_EVENT, name: 'mate' }]);
    });
  });

  describe('onPromotionSelection', () => {
    it('emits a board.promote event', () => {
      onPromotionSelection({ x: 0, y: 1 }, 5)(dispatchSpy, undefined, socketSpy);
      expect(socketSpy.emit).toHaveBeenCalledWith('board.promote', { x: 0, y: 1 }, 5);
    });
  });

  describe('updateMembers', () => {
    let getStateSpy;
    beforeEach(() => {
      getStateSpy = jasmine.createSpy('getState').and.returnValue({
        members: [
          { id: 'abc123', name: 'Bobby' },
          { id: 'def456', name: 'Casper' },
          { id: 'xyz', name: null },
        ]
      });
    });
    it('updates the members list', () => {
      updateMembers([{ id: 'abc123' }])(dispatchSpy, getStateSpy);
      expect(dispatchSpy).toHaveBeenCalledWith({ type: UPDATE_MEMBERS, members: [{ id: 'abc123' }] });
    });
    it('sends announcements for changes in the members list', () => {
      updateMembers([
        { id: 'abc123', name: 'Bobby' },
        { id: 'n3w', name: null },
        { id: 'xyz', name: 'Gary' }
      ])(dispatchSpy, getStateSpy);
      expect(getStateSpy).toHaveBeenCalledBefore(dispatchSpy);
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: ADD_MESSAGE,
        message: { type: 'event', message: 'Gary connected' }
      });
      expect(dispatchSpy).toHaveBeenCalledWith({
        type: ADD_MESSAGE,
        message: { type: 'event', message: 'Casper disconnected' }
      });
      expect(dispatchSpy).not.toHaveBeenCalledWith({
        type: ADD_MESSAGE,
        message: { type: 'event', message: 'null connected' }
      });
    })
  });

  describe('sendMessage', () => {
    it('sends the message via the socket', () => {
      sendMessage('chess is fun!')(dispatchSpy, undefined, socketSpy);
      expect(socketSpy.emit).toHaveBeenCalledWith('speak', 'chess is fun!');
    });
  });

  describe('processMessage', () => {
    it('adds the message', () => {
      const action = processMessage({ id: 'abc123', name: 'Bobby' }, 'you will never mate me!');
      expect(action).toEqual({
        type: ADD_MESSAGE,
        message: {
          message: 'you will never mate me!',
          type: 'chat',
          author: { id: 'abc123', name: 'Bobby' },
        },
      });
    });
  });
  describe('processEventMessage', () => {
    it('adds the message', () => {
      const action = processAnnouncement('Bobby sat down as white.');
      expect(action).toEqual({
        type: ADD_MESSAGE,
        message: { message: 'Bobby sat down as white.', type: 'event' },
      });
    });
  });
});
