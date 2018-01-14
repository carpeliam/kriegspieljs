import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import Modal from 'react-modal';
import UserNamePrompterContainer, { UserNamePrompter } from '../../client/username-prompter';
import * as actions from '../../client/actions';

describe('UserNamePrompter', () => {
  const setUserSpy = jasmine.createSpy('setUser');
  function createUserNamePrompter(props = {}) {
    return shallow(
      <UserNamePrompter
        user={props.user || null}
        setUser={props.setUser || setUserSpy}
      />
    );
  }
  it('is visible if the username is undefined', () => {
    const component = createUserNamePrompter({user: { id: 1 }});
    expect(component.find(Modal)).toHaveProp('isOpen', true);
  });

  it('is hidden if the username is present', () => {
    const component = createUserNamePrompter({user: { id: 1, name: 'jim' }});
    expect(component.find(Modal)).toHaveProp('isOpen', false);
  });

  describe('when the button is clicked', () => {
    it('calls the signin call back with the username', () => {
      const component = createUserNamePrompter({ user: { id: 1 } });
      component.find('input').simulate('change', { target: { value: 'Jim' } });
      component.find('button').simulate('click');
      expect(setUserSpy).toHaveBeenCalledWith('Jim');
    });
  });
});

describe('UserNamePrompter container', () => {
  let container;
  let store;
  beforeEach(() => {
    store = createStore(state => state, { user: { id: 'abc123' } });
    spyOn(store, 'dispatch');
    container = shallow(<UserNamePrompterContainer store={store} />);
  });

  it('passes down user state', () => {
    expect(container.find(UserNamePrompter)).toHaveProp('user', { id: 'abc123' });
  });

  it('passes setUser action', () => {
    spyOn(actions, 'setUser').and.returnValue({ type: 'set user' });
    container.find(UserNamePrompter).props().setUser('margaret');
    expect(actions.setUser).toHaveBeenCalledWith('margaret');
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'set user' });
  });
});
