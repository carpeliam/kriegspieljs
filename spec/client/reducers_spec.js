import { SET_USER, UPDATE_PLAYER } from '../../client/actions';
import { user, game } from '../../client/reducers';

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
  it('has a default state with empty player info', () => {
    expect(game(undefined, { type: 'SOME_ACTION' })).toEqual({ players: {} });
  });
  it('updates the players upon an UPDATE_PLAYER action', () => {
    const state = game({ players: { black: { id: 2 } } }, { type: UPDATE_PLAYER, color: 'white', user: { id: 1 } });
    expect(state).toEqual({ players: { white: { id: 1 }, black: { id: 2 } } });
  });
});
