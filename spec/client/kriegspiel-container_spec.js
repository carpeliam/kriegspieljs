import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import KriegspielContainer from '../../client/kriegspiel-container';
import Kriegspiel from '../../client/kriegspiel';
import * as actions from '../../client/actions';

describe('Kriegspiel Container', () => {
  let container;
  let store;
  beforeEach(() => {
    store = createStore(state => state, {
      user: { name: 'margaret', id: 'abc123' },
    });
    spyOn(store, 'dispatch');
    container = shallow(<KriegspielContainer store={store} />);
  });

  it('contains a Kriegspiel child component', () => {
    expect(container.find(Kriegspiel)).toBePresent();
  });

  it('passes user props to child component', () => {
    expect(container).toHaveProp('user', { name: 'margaret', id: 'abc123' });
  });

  it('passes setUser action to child component', () => {
    spyOn(actions, 'setUser').and.returnValue('set user');
    container.props().setUser('margaret');
    expect(actions.setUser).toHaveBeenCalledWith('margaret');
    expect(store.dispatch).toHaveBeenCalledWith('set user');
  });

  // it('passes onReserveTable to child component', () => {
  //   spyOn(actions, 'reserveTable').and.returnValue('reserveTable');
  //   container.props().onReserveTable('table');
  //   expect(actions.reserveTable).toHaveBeenCalledWith('table');
  //   expect(store.dispatch).toHaveBeenCalledWith('reserveTable');
  // });

  // it('passes onRemoveReservation to child component', () => {
  //   spyOn(actions, 'removeReservation').and.returnValue('removeReservation');
  //   container.props().onRemoveReservation('reservation');
  //   expect(actions.removeReservation).toHaveBeenCalledWith('reservation');
  //   expect(store.dispatch).toHaveBeenCalledWith('removeReservation');
  // });

  // it('passes fetchTables to child component', () => {
  //   spyOn(actions, 'fetchTables').and.returnValue('fetchTables');
  //   container.props().fetchTables();
  //   expect(actions.fetchTables).toHaveBeenCalled();
  //   expect(store.dispatch).toHaveBeenCalledWith('fetchTables');
  // });
});
