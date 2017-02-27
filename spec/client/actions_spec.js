import shortid from 'shortid';
import * as cookieMonster from '../../client/cookie-monster';
import { SET_USER, setUser } from '../../client/actions';

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
