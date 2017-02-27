import { combineReducers } from 'redux';
import { SET_USER } from './actions';

export function user(state = null, action) {
  switch (action.type) {
    case SET_USER:
      return action.user;
    default:
      return state;
  }
}

export default combineReducers({ user });
