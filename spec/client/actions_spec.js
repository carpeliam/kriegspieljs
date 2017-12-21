import shortid from 'shortid';
import * as cookieMonster from '../../client/cookie-monster';
import {
  SET_USER,
  UPDATE_PLAYER,
  setUser,
  sitAs,
  standAs,
} from '../../client/actions';

describe('setUser', () => {
  beforeEach(() => {
    spyOn(shortid, 'generate').and.returnValue('abc123');
    spyOn(cookieMonster, 'setUser');
  });
  it('sets the user name and saves a cookie', () => {
    const user = { id: 'abc123', name: 'margaret' };
    const action = setUser('margaret');
    expect(cookieMonster.setUser).toHaveBeenCalledWith(user);
    expect(action).toEqual({ type: SET_USER, user });
  });
});

describe('sitAs', () => {
  it('updates the game with the given player sitting in the given color', () => {
    const action = sitAs('white', { id: 'abc123' });
    expect(action).toEqual({ type: UPDATE_PLAYER, user: { id: 'abc123' }, color: 'white' });
  });
});

describe('standAs', () => {
  it('updates the game with an undefined player in the given color', () => {
    const action = standAs('white');
    expect(action).toEqual({ type: UPDATE_PLAYER, user: undefined, color: 'white' });
  });
});
