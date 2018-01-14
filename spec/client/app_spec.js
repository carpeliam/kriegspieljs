import React from 'react';
import { mount } from 'enzyme';
import Modal from 'react-modal';
import Cookie from 'js-cookie';
import App from '../../client/app';
describe('App', () => {
  Modal.setAppElement(document.body);
  let user;
  beforeEach(() => {
    spyOn(Cookie, 'get').and.callFake(() => user);
    spyOn(Cookie, 'set').and.callFake((u) => user = u);
  });

  it('can be mounted', () => {
    mount(<App />);
  });
});
