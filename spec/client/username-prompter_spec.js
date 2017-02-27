import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { Modal } from 'react-bootstrap';

import UserNamePrompter from '../../client/username-prompter';

describe('UserNamePrompter', () => {
  const onEnter = jasmine.createSpy('onEnter');
  function createUserNamePrompter(props = {}) {
    return ReactTestUtils.renderIntoDocument(<UserNamePrompter
      user={props.user || null} onEnter={props.onEnter || onEnter} />);
  }
  it('is visible if the username is undefined', () => {
    const component = createUserNamePrompter({user: undefined});
    // TODO test via class name
    const modal = ReactTestUtils.findRenderedComponentWithType(component, Modal);
    expect(modal.props.show).toBe(true);
  });

  it('is hidden if the username is present', () => {
    const component = createUserNamePrompter({user: 'jim'});
    const modal = ReactTestUtils.findRenderedComponentWithType(component, Modal);
    expect(modal.props.show).toBe(false);
  });

  describe('when the button is clicked', () => {
    it('calls the signin call back with the username');
  });

  describe('on hide', () => {
    it('stays open');
  });
});
