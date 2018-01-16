import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import { SeatList, Seat, SeatContainer } from '../../client/seat-list';

describe('Seat', () => {
  let onSitOrStandSpy;
  let sitAsSpy;
  let standSpy;
  let resignSpy;
  beforeEach(() => {
    onSitOrStandSpy = jasmine.createSpy();
    sitAsSpy = jasmine.createSpy('sitAs');
    standSpy = jasmine.createSpy('stand');
    resignSpy = jasmine.createSpy('resign');
  });

  it('shows when a current seat has an active move', () => {
    const activeSeat = shallow(<Seat
      color="white"
      active
      inProgress={false}
      winning={false}
      losing={false}
      user={{ id: 1 }}
      players={{}}
      sitAs={sitAsSpy}
      stand={standSpy}
      resign={resignSpy}
    />);
    expect(activeSeat.find('.btn-white')).toHaveClassName('active');
  });

  it('shows when a current seat is occupied by the winning player', () => {
    const activeSeat = shallow(<Seat
      color="white"
      inProgress={false}
      winning
      losing={false}
      user={{ id: 1 }}
      players={{}}
      sitAs={sitAsSpy}
      stand={standSpy}
      resign={resignSpy}
    />);
    expect(activeSeat.find('.btn-white')).toHaveClassName('winning');
  });

  it('shows when a current seat is occupied by the losing player', () => {
    const activeSeat = shallow(<Seat
      color="white"
      inProgress={false}
      winning={false}
      losing
      user={{ id: 1 }}
      players={{}}
      sitAs={sitAsSpy}
      stand={standSpy}
      resign={resignSpy}
    />);
    expect(activeSeat.find('.btn-white')).toHaveClassName('losing');
  });

  describe('when the user is not currently sitting', () => {
    it('allows the user to sit in an open seat', () => {
      const seat = shallow(<Seat
        color="white"
        inProgress={false}
        winning={false}
        losing={false}
        user={{ id: 1 }}
        players={{}}
        sitAs={sitAsSpy}
        stand={standSpy}
        resign={resignSpy}
      />);
      expect(seat.find('.btn-white')).toHaveProp('disabled', false);
      expect(seat.find('.btn-white')).toHaveText('sit as white');
      seat.find('.btn-white').simulate('click');
      expect(sitAsSpy).toHaveBeenCalledWith('white', { id: 1 });
      expect(standSpy).not.toHaveBeenCalled();
    });
    it('does not allow the user to sit in an occupied seat', () => {
      const seat = shallow(<Seat
        color="white"
        inProgress={false}
        winning={false}
        losing={false}
        user={{ id: 1 }}
        players={{ white: { id: 2, name: 'Bobby' } }}
        sitAs={sitAsSpy}
        stand={standSpy}
        resign={resignSpy}
      />);
      expect(seat.find('.btn-white')).toHaveProp('disabled', true);
      expect(seat.find('.btn-white')).toHaveText('white: Bobby');
    });
  });

  describe('when the user is currently sitting', () => {
    it('allows the user to stand from their seat if the game is not in progress', () => {
      const seat = shallow(<Seat
        color="white"
        inProgress={false}
        winning={false}
        losing={false}
        user={{ id: 1 }}
        players={{ white: { id: 1, name: 'Frank' } }}
        sitAs={sitAsSpy}
        stand={standSpy}
        resign={resignSpy}
      />);
      expect(seat.find('.btn-white')).toHaveProp('disabled', false);
      expect(seat.find('.btn-white')).toHaveText('leave white');
      seat.find('.btn-white').simulate('click');
      expect(standSpy).toHaveBeenCalled();
      expect(resignSpy).not.toHaveBeenCalled();
      expect(sitAsSpy).not.toHaveBeenCalled();
    });
    it('allows the user to resign if the game is in progress', () => {
      const seat = shallow(<Seat
        color="white"
        inProgress={true}
        winning={false}
        losing={false}
        user={{ id: 1 }}
        players={{ white: { id: 1, name: 'Frank' } }}
        sitAs={sitAsSpy}
        stand={standSpy}
        resign={resignSpy}
      />);
      expect(seat.find('.btn-white')).toHaveProp('disabled', false);
      expect(seat.find('.btn-white')).toHaveText('resign as white');
      seat.find('.btn-white').simulate('click');
      expect(resignSpy).toHaveBeenCalled();
      expect(standSpy).not.toHaveBeenCalled();
      expect(sitAsSpy).not.toHaveBeenCalled();
    });
    it('does not allow them to sit in the other seat', () => {
      const seat = shallow(<Seat
        color="white"
        inProgress={false}
        winning={false}
        losing={false}
        user={{ id: 1 }}
        players={{ black: { id: 1, name: 'Frank' } }}
        sitAs={sitAsSpy}
        stand={standSpy}
        resign={resignSpy}
      />);
      expect(seat.find('.btn-white')).toHaveProp('disabled', true);
    });
  });
});

describe('SeatContainer', () => {
  let container;
  let store;
  const user = { name: 'margaret', id: 'abc123' };
  const allPlayers = {
    white: Object.assign({ resigned: false }, user),
    black: { name: 'jim', id: '123abc', resigned: false }
  };
  beforeEach(() => {
    store = createStore(state => state, {
      user,
      game: {
        players: allPlayers,
        board: { turn: 1, inProgress: true },
        mate: false,
      },
    });
    spyOn(store, 'dispatch');
    container = shallow(<SeatContainer store={store} color="white" />);
  });

  it('passes user and game state to the seat', () => {
    const seat = container.find(Seat);
    expect(seat).toHaveProp('color', 'white');
    expect(seat).toHaveProp('active', true);
    expect(seat).toHaveProp('inProgress', true);
    expect(seat).toHaveProp('winning', false);
    expect(seat).toHaveProp('losing', false);
    expect(seat).toHaveProp('user', user);
    expect(seat).toHaveProp('players', allPlayers);
  });

  it('passes winning state if opposing player has resigned', () => {
    store = createStore(state => state, {
      user,
      game: {
        players: {
          white: user,
          black: { name: 'jim', id: '123abc', resigned: true }
        },
        board: { turn: -1, inProgress: true },
        mate: false,
      },
    });
    spyOn(store, 'dispatch');
    container = shallow(<SeatContainer store={store} color="white" />);
    const seat = container.find(Seat);
    expect(seat).toHaveProp('winning', true);
    expect(seat).toHaveProp('losing', false);
  });

  it('passes winning state if game is in mate and current player does not turn', () => {
    store = createStore(state => state, {
      user,
      game: {
        players: allPlayers,
        board: { turn: -1, inProgress: true },
        mate: true,
      },
    });
    spyOn(store, 'dispatch');
    container = shallow(<SeatContainer store={store} color="white" />);
    const seat = container.find(Seat);
    expect(seat).toHaveProp('winning', true);
    expect(seat).toHaveProp('losing', false);
  });

  it('passes losing state if given player has resigned', () => {
    store = createStore(state => state, {
      user,
      game: {
        players: {
          white: Object.assign({ resigned: true }, user),
          black: allPlayers.black,
        },
        board: { turn: -1, inProgress: true },
        mate: false,
      },
    });
    spyOn(store, 'dispatch');
    container = shallow(<SeatContainer store={store} color="white" />);
    const seat = container.find(Seat);
    expect(seat).toHaveProp('winning', false);
    expect(seat).toHaveProp('losing', true);
  });

  it('passes losing state if game is in mate and current player has turn', () => {
    store = createStore(state => state, {
      user,
      game: {
        players: allPlayers,
        board: { turn: 1, inProgress: true },
        mate: true,
      },
    });
    spyOn(store, 'dispatch');
    container = shallow(<SeatContainer store={store} color="white" />);
    const seat = container.find(Seat);
    expect(seat).toHaveProp('winning', false);
    expect(seat).toHaveProp('losing', true);
  });

  it('does not pass active color if at least one seat is empty', () => {
    store = createStore(state => state, {
      user,
      game: {
        players: { white: allPlayers.white },
        board: { turn: 1, inProgress: true },
        mate: false,
      },
    });
    container = shallow(<SeatContainer store={store} color="white" />);
    const seat = container.find(Seat);
    expect(seat).not.toHaveProp('active');
  });
});
