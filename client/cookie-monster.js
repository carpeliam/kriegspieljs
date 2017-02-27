import Cookie from 'js-cookie';

const COOKIE_NAME = 'kriegspiel.user';

export function fetchUser() {
  const cookie = Cookie.get(COOKIE_NAME);
  return cookie && JSON.parse(cookie);
}

export function setUser(user) {
  Cookie.set(COOKIE_NAME, JSON.stringify(user));
}
