import Cookie from 'js-cookie';
import shortid from 'shortid';
import { fetchUser, setUser } from '../../client/cookie-monster';

describe('cookieMonster', () => {
  const user = { id: 'abc123', name: 'margaret' };
  beforeEach(() => {
    spyOn(Cookie, 'getJSON');
    spyOn(Cookie, 'set');
  });
  describe('#fetchUser', () => {
    it('retrieves and parses a user from a cookie when present', () => {
      Cookie.getJSON.and.returnValue(user);
      expect(fetchUser()).toEqual(user);
      expect(Cookie.getJSON).toHaveBeenCalledWith('kriegspiel.user');
    });

    it('returns a new ID and sets the user when a cookie is not present', () => {
      Cookie.getJSON.and.returnValue(undefined);
      spyOn(shortid, 'generate').and.returnValue('abc123');
      expect(fetchUser()).toEqual({ id: 'abc123' });
      expect(Cookie.getJSON).toHaveBeenCalledWith('kriegspiel.user');
      expect(Cookie.set).toHaveBeenCalled();
    });
  });

  describe('#setUser', () => {
    it('sets a stringified version of the user', () => {
      setUser(user);
      expect(Cookie.set).toHaveBeenCalledWith('kriegspiel.user', user);
    });
  });
});
