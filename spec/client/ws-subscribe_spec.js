import subcribeToSocketEvents from '../../client/ws-subscribe';
import * as actions from '../../client/actions';
import * as cookieMonster from '../../client/cookie-monster';
import subscribeToSocketEvents from '../../client/ws-subscribe';

describe('subcribeToSocketEvents', () => {
  function fakeSocket() {
    const listeners = {};
    const events = {};
    return {
      on(event, cb) {
        listeners[event] = cb;
      },
      receive(event, ...args) {
        const cb = listeners[event];
        if (!cb) {
          throw new Error(`no listener defined for ${event}`);
        }
        cb(...args);
      },
      emit(event, ...args) {
        events[event] || (events[event] = []);
        events[event].push(args);
      },
      events(event) {
        return events[event];
      }
    };
  }
  let dispatchSpy;
  let socket;
  beforeEach(() => {
    dispatchSpy = jasmine.createSpy('dispatch');
    socket = fakeSocket();
  });
  it('emits the nickname upon connecting', () => {
    spyOn(cookieMonster, 'fetchUser').and.returnValue({ id: 'abc123', name: 'margaret' });
    subcribeToSocketEvents(dispatchSpy, socket);
    socket.receive('connect');
    expect(socket.events('nickname.set')).toEqual([['margaret']]);
  });
  it('updates board state upon joining a room', () => {
    spyOn(actions, 'updateBoard').and.returnValue({ type: 'update board' });
    subcribeToSocketEvents(dispatchSpy, socket);
    socket.receive('board.update', { board: { turn: 1 } });
    expect(actions.updateBoard).toHaveBeenCalledWith({ turn: 1 });
    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'update board' });
  });
  it('resets board state upon receiving a board reset', () => {
    spyOn(actions, 'resetGame').and.returnValue({ type: 'reset board' });
    subcribeToSocketEvents(dispatchSpy, socket);
    socket.receive('game.reset', { board: { turn: 1 } });
    expect(actions.resetGame).toHaveBeenCalledWith({ turn: 1 });
    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'reset board' });
  });
  it('seats a player upon receiving a sit notification', () => {
    spyOn(actions, 'updatePlayer').and.returnValue({ type: 'sit' });
    subcribeToSocketEvents(dispatchSpy, socket);
    socket.receive('sit', 'white', { id: 'abc123', name: 'margaret' });
    expect(actions.updatePlayer).toHaveBeenCalledWith('white', { id: 'abc123', name: 'margaret' });
    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'sit' });
  });
  it('removes a player from their seat upon receiving a stand notification', () => {
    spyOn(actions, 'updatePlayer').and.returnValue({ type: 'stand' });
    subcribeToSocketEvents(dispatchSpy, socket);
    socket.receive('stand', 'white');
    expect(actions.updatePlayer).toHaveBeenCalledWith('white', undefined);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'stand' });
  });
  it('updates board state upon moves', () => {
    spyOn(actions, 'updateBoardWithMove').and.returnValue({ type: 'update with move' });
    subcribeToSocketEvents(dispatchSpy, socket);
    socket.receive('board.move', { x: 0, y: 1 }, { x: 2, y: 3 });
    expect(actions.updateBoardWithMove).toHaveBeenCalledWith({ x: 0, y: 1 }, { x: 2, y: 3 });
    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'update with move' });
  });
  it('updates board state upon promotions', () => {
    spyOn(actions, 'updateBoardWithPromotion').and.returnValue({ type: 'update board with promotion' });
    subcribeToSocketEvents(dispatchSpy, socket);
    socket.receive('board.promote', { x: 1, y: 2 }, 5);
    expect(actions.updateBoardWithPromotion).toHaveBeenCalledWith({ x: 1, y: 2 }, 5);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'update board with promotion' });
  });
  it('updates members list upon receiving changes', () => {
    spyOn(actions, 'updateMembers').and.returnValue({ type: 'update members' });
    subcribeToSocketEvents(dispatchSpy, socket);
    socket.receive('room.list', [{ id: 'abc123' }]);
    expect(actions.updateMembers).toHaveBeenCalledWith([{ id: 'abc123' }]);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'update members' });
  });
  it('adds processes chat messages', () => {
    spyOn(actions, 'processMessage').and.returnValue({ type: 'process message' });
    subscribeToSocketEvents(dispatchSpy, socket);
    socket.receive('speak', { id: 'abc123', name: 'margaret' }, 'I have you now!');
    expect(actions.processMessage).toHaveBeenCalledWith({ id: 'abc123', name: 'margaret' }, 'I have you now!');
    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'process message' });
  });
});
