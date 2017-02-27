import { SET_USER } from '../../client/actions';
import { user } from '../../client/reducers';

describe('user reducer', () => {
  it('has a default state of null', () => {
    expect(user(undefined, { type: 'SOME_ACTION' })).toBeNull();
  });
  it('sets the user upon receiving a SET_USER action', () => {
    const currentUser = { id: 'abc123', name: 'margaret' };
    expect(user(undefined, { type: SET_USER, user: currentUser })).toEqual(currentUser);
  });
});
