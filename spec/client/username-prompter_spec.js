import '../client_helper';

import UserNamePrompter from '../../client/username-prompter';

describe('UserNamePrompter', () => {
  it('is visible if the username is null');

  it('is hidden if the username is present');

  describe('when the button is clicked', () => {
    it('calls the signin call back with the username');
  });

  describe('on hide', () => {
    it('stays open');
  });
});
