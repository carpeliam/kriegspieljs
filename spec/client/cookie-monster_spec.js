import Cookie from 'js-cookie';
import shortid from 'shortid';
import { fetchUser, setUser } from '../../client/cookie-monster';

describe('cookieMonster', () => {
  const user = { id: 'abc123', name: 'margaret' };
  describe('#fetchUser', () => {
    it('retrieves and parses a user from a cookie when present', () => {
      spyOn(Cookie, 'get').and.returnValue(JSON.stringify(user));
      expect(fetchUser()).toEqual(user);
      expect(Cookie.get).toHaveBeenCalledWith('kriegspiel.user');
    });

    it('returns a new ID when a cookie is not present', () => {
      spyOn(shortid, 'generate').and.returnValue('abc123');
      spyOn(Cookie, 'get').and.returnValue(undefined);
      expect(fetchUser()).toEqual({ id: 'abc123' });
      expect(Cookie.get).toHaveBeenCalledWith('kriegspiel.user');
    });
  });

  describe('#setUser', () => {
    it('sets a stringified version of the user', () => {
      spyOn(Cookie, 'set');
      setUser(user);
      expect(Cookie.set).toHaveBeenCalledWith('kriegspiel.user', JSON.stringify(user));
    });
  });
});
