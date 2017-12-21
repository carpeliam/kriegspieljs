import React from 'react';
import { mount } from 'enzyme';
import Cookie from 'js-cookie';
import App from '../../client/app';
describe('App', () => {
  let user;
  beforeEach(() => {
    spyOn(Cookie, 'get').and.callFake(() => user);
    spyOn(Cookie, 'set').and.callFake((u) => user = u);
  });

  it('can be mounted', () => {
    mount(<App />);
    // modal isn't actually rendered within App
    // app.find('input').simulate('change', { target: { value: 'margaret' } });
    // app.find('button').simulate('click');
  });
});
