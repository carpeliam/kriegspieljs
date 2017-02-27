import shortid from 'shortid';
import { setUser as setUserCookie } from './cookie-monster';

export const SET_USER = 'SET_USER';

export function setUser(name) {
  const user = { id: shortid.generate(), name };
  setUserCookie(user);
  return { type: SET_USER, user };
}
