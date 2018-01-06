import React from 'react';
import { shallow } from 'enzyme';
import { Room } from '../../client/room';

describe('Room', () => {
  let wrapper;
  const members = [
    {
      id: 'abc123',
      name: 'Bobby',
    },
    {
      id: '123abc',
      name: 'Gary',
    },
  ];
  beforeEach(() => {
    wrapper = shallow(<Room members={members} />);
  });
  it('displays the room members', () => {
    expect(wrapper).toIncludeText('Bobby');
    expect(wrapper).toIncludeText('Gary');
  });
});
