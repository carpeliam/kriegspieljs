import subcribeToSocketEvents from '../../client/ws-subscribe';
import * as actions from '../../client/actions';
import * as cookieMonster from '../../client/cookie-monster';

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
  it('seats a player upon receiving a sit notification', () => {
    spyOn(actions, 'updatePlayer').and.returnValue({ type: 'sit' });
    subcribeToSocketEvents(dispatchSpy, socket);
    socket.receive('sit', 'white', { id: 'abc123', name: 'margaret' });
    expect(actions.updatePlayer).toHaveBeenCalledWith('white', { id: 'abc123', name: 'margaret' });
    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'sit' });
  });
  it('updates board state upon moves', () => {
    spyOn(actions, 'updateBoardWithMove').and.returnValue({ type: 'update with move' });
    subcribeToSocketEvents(dispatchSpy, socket);
    socket.receive('board.move', { x: 0, y: 1 }, { x: 2, y: 3 });
    expect(actions.updateBoardWithMove).toHaveBeenCalledWith({ x: 0, y: 1 }, { x: 2, y: 3 });
    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'update with move' });
  });
  it('updates members list upon receiving changes', () => {
    spyOn(actions, 'updateMembers').and.returnValue({ type: 'update members' });
    subcribeToSocketEvents(dispatchSpy, socket);
    socket.receive('room.list', [{ id: 'abc123' }]);
    expect(actions.updateMembers).toHaveBeenCalledWith([{ id: 'abc123' }]);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'update members' });
  });
});
