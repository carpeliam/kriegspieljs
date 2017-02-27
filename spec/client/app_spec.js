import React from 'react';
import { mount } from 'enzyme';
import Cookie from 'js-cookie';
import App from '../../client/app';
describe('App', () => {
  let app;
  let user;
  beforeEach(() => {
    spyOn(Cookie, 'get').and.callFake(() => user);
    spyOn(Cookie, 'set').and.callFake((u) => user = u);
    app = mount(<App />);
  });

  it('does cool stuff', () => {
    // modal isn't actually rendered within App
    // app.find('input').simulate('change', { target: { value: 'margaret' } });
    // app.find('button').simulate('click');
  });
});
