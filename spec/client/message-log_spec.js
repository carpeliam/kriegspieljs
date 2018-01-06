import '../client_helper';

import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';

import MessageLog from '../../client/message-log';


describe('MessageLog', () => {
  function createSeatList(props = {}) {
    props.messages || (props.messages = []);
    return ReactTestUtils.renderIntoDocument(<MessageLog {...props} />);
  }
  it('reports any messages sent', () => {
    let onMessageSubmitSpy = jasmine.createSpy('onMessageSubmit');
    let seatList = createSeatList({onMessageSubmit: onMessageSubmitSpy});
    let form = ReactTestUtils.findRenderedDOMComponentWithTag(seatList, 'form');
    ReactTestUtils.Simulate.submit(form);
    expect(onMessageSubmitSpy).toHaveBeenCalled();
  });
});
