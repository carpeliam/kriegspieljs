import shortid from 'shortid';
import { setUser as setUserCookie } from './cookie-monster';

export const SET_USER = 'SET_USER';
export const UPDATE_PLAYER = 'UPDATE_PLAYER';

export function setUser(name) {
  const user = { id: shortid.generate(), name };
  setUserCookie(user);
  return { type: SET_USER, user };
}

export function sitAs(color, user) {
  return { type: UPDATE_PLAYER, color, user };
}

export function standAs(color) {
  return { type: UPDATE_PLAYER, color, user: undefined };
}
