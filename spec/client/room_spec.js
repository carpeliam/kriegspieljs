import React from 'react';
import { createStore } from 'redux';
import { shallow, mount } from 'enzyme';
import Room from '../../client/room';
import * as actions from '../../client/actions';

describe('Room', () => {
  const members = [
    { id: 'abc123', name: 'Bobby' },
    { id: '123abc', name: 'Gary' },
  ];
  const messages = [
    { message: 'Bishops wear funny hats.', type: 'chat', author: { id: 'abc123', name: 'Bobby' } },
    { message: 'Taste cold steel, rook!', type: 'chat', author: { id: '123abc', name: 'Gary' } },
    { message: 'Bobby sat down as white.', type: 'event' },
    { message: 'The pawn on f4 can make a capture.', type: 'event' },
    { message: 'Check!', type: 'check' },
    { message: 'Checkmate.', type: 'mate' },
  ];
  let wrapper;
  let store;
  let submitSpy = jasmine.createSpyObj('submit', ['preventDefault']);
  beforeEach(() => {
    store = createStore(state => state, {
      members,
      messages,
    });
    spyOn(store, 'dispatch');
    wrapper = mount(<Room store={store} />);
  });
  it('displays the room members', () => {
    expect(wrapper.find('.members')).toIncludeText('Bobby');
    expect(wrapper.find('.members')).toIncludeText('Gary');
  });
  it('displays chat messages', () => {
    expect(wrapper.find('.messages .chat').at(0)).toIncludeText('Bobby: Bishops wear funny hats.');
    expect(wrapper.find('.messages .chat').at(1)).toIncludeText('Gary: Taste cold steel, rook!');
  });
  it('displays other events', () => {
    expect(wrapper.find('.messages .event').at(0)).toHaveText('Bobby sat down as white.');
    expect(wrapper.find('.messages .event').at(1)).toHaveText('The pawn on f4 can make a capture.');
    expect(wrapper.find('.messages .check')).toHaveText('Check!');
    expect(wrapper.find('.messages .mate')).toHaveText('Checkmate.');
  });
  it('calls the sendMessage action whenever a chat form is submitted', () => {
    spyOn(actions, 'sendMessage').and.returnValue({ type: 'send message' });
    wrapper.find('input').simulate('change', { target: { value: 'I will end you, chessboy.' } });
    wrapper.find('form').simulate('submit', submitSpy);
    expect(submitSpy.preventDefault).toHaveBeenCalled();
    expect(actions.sendMessage).toHaveBeenCalledWith('I will end you, chessboy.');
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'send message' });
    expect(wrapper.find('input')).toHaveValue('');
  });
  it('does not call sendMessage if no input has been entered', () => {
    spyOn(actions, 'sendMessage');
    wrapper.find('form').simulate('submit', submitSpy);
    expect(submitSpy.preventDefault).toHaveBeenCalled();
    expect(actions.sendMessage).not.toHaveBeenCalled();
  });
});
