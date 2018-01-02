import Cookie from 'js-cookie';
import shortid from 'shortid';

const COOKIE_NAME = 'kriegspiel.user';

export function fetchUser() {
  const cookie = Cookie.get(COOKIE_NAME);
  if (cookie) {
    return JSON.parse(cookie);
  } else {
    const user = { id: shortid.generate() };
    setUser(user);
    return user;
  }
}

export function setUser(user) {
  Cookie.set(COOKIE_NAME, JSON.stringify(user));
}
