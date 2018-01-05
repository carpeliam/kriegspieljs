import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import { SeatList, Seat, SeatContainer } from '../../client/seat-list';

describe('Seat', () => {
  let onSitOrStandSpy;
  let sitAsSpy;
  let standAsSpy;
  beforeEach(() => {
    onSitOrStandSpy = jasmine.createSpy();
    sitAsSpy = jasmine.createSpy('sitAs');
    standAsSpy = jasmine.createSpy('standAs');
  });

  it('shows when a current seat has an active move', () => {
    const activeSeat = shallow(<Seat
      color="white"
      active
      user={{ id: 1 }}
      players={{}}
      sitAs={sitAsSpy}
      standAs={standAsSpy}
    />);
    expect(activeSeat.find('.btn-white')).toHaveClassName('active');
  });

  it('shows when a current seat is occupied by the winning player', () => {
    const activeSeat = shallow(<Seat
      color="white"
      winning
      user={{ id: 1 }}
      players={{}}
      sitAs={sitAsSpy}
      standAs={standAsSpy}
    />);
    expect(activeSeat.find('.btn-white')).toHaveClassName('winning');
  });

  it('shows when a current seat is occupied by the losing player', () => {
    const activeSeat = shallow(<Seat
      color="white"
      losing
      user={{ id: 1 }}
      players={{}}
      sitAs={sitAsSpy}
      standAs={standAsSpy}
    />);
    expect(activeSeat.find('.btn-white')).toHaveClassName('losing');
  });

  describe('when the user is not currently sitting', () => {
    it('allows the user to sit in an open seat', () => {
      const seat = shallow(<Seat
        color="white"
        user={{ id: 1 }}
        players={{}}
        sitAs={sitAsSpy}
        standAs={standAsSpy}
      />);
      expect(seat.find('.btn-white')).toHaveProp('disabled', false);
      expect(seat.find('.btn-white')).toHaveText('sit as white');
      seat.find('.btn-white').simulate('click');
      expect(sitAsSpy).toHaveBeenCalledWith('white', { id: 1 });
      expect(standAsSpy).not.toHaveBeenCalled();
    });
    it('does not allow the user to sit in an occupied seat', () => {
      const seat = shallow(<Seat
        color="white"
        user={{ id: 1 }}
        players={{ white: { id: 2, name: 'Bobby' } }}
        sitAs={sitAsSpy}
        standAs={standAsSpy}
      />);
      expect(seat.find('.btn-white')).toHaveProp('disabled', true);
      expect(seat.find('.btn-white')).toHaveText('white: Bobby');
    });
  });

  describe('when the user is currently sitting', () => {
    it('allows the user to stand from their seat', () => {
      const seat = shallow(<Seat
        color="white"
        user={{ id: 1 }}
        players={{ white: { id: 1, name: 'Frank' } }}
        sitAs={sitAsSpy}
        standAs={standAsSpy}
      />);
      expect(seat.find('.btn-white')).toHaveProp('disabled', false);
      expect(seat.find('.btn-white')).toHaveText('leave white');
      seat.find('.btn-white').simulate('click');
      expect(standAsSpy).toHaveBeenCalledWith('white');
      expect(sitAsSpy).not.toHaveBeenCalled();
    });
    it('does not allow them to sit in the other seat', () => {
      const seat = shallow(<Seat
        color="white"
        user={{ id: 1 }}
        players={{ black: { id: 1, name: 'Frank' } }}
        sitAs={sitAsSpy}
        standAs={standAsSpy}
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
    white: user,
    black: { name: 'jim', id: '123abc' }
  };
  beforeEach(() => {
    store = createStore(state => state, {
      user,
      game: {
        players: allPlayers,
        board: { turn: 1 },
      },
    });
    spyOn(store, 'dispatch');
    container = shallow(<SeatContainer store={store} color="white" />);
  });

  it('passes user and game state to the seat', () => {
    const seat = container.find(Seat);
    expect(seat).toHaveProp('user', user);
    expect(seat).toHaveProp('players', allPlayers);
    expect(seat).toHaveProp('active', true);
  });

  it('passes winning state if game is in mate and current player does not turn', () => {
    store = createStore(state => state, {
      user,
      game: {
        players: allPlayers,
        board: { turn: -1 },
        mate: true,
      },
    });
    spyOn(store, 'dispatch');
    container = shallow(<SeatContainer store={store} color="white" />);
    const seat = container.find(Seat);
    expect(seat).toHaveProp('winning', true);
    expect(seat).toHaveProp('losing', false);
  });

  it('passes losing state if game is in mate and current player has turn', () => {
    store = createStore(state => state, {
      user,
      game: {
        players: allPlayers,
        board: { turn: 1 },
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
        players: { white: user },
        board: { turn: 1 },
      },
    });
    container = shallow(<SeatContainer store={store} color="white" />);
    const seat = container.find(Seat);
    expect(seat).not.toHaveProp('active');
  });
});

xdescribe('SeatList', () => {
//   var sitOrStandAs;
  let seatList;
  let sitAs;
  let standAs;
  beforeEach(() => {
    sitAs = jasmine.createSpy('sitAs');
    standAs = jasmine.createSpy('standAs');
    const props = { sitAs, standAs };
    seatList = shallow(<SeatList {...props} />);
  });

  describe('when the user is playing as white', () => {
    beforeEach(() => seatList.setProps({ players: { white: { id: 1 } }, user: { id: 1 } }));
    it('lets the player stand as white', () => {
      const white = seatList.find(Seat).filter({ color: 'white '});
      white.sitAsOrStand();
    });
  });

//   xdescribe('when the user is a guest', () => {
//     beforeEach(() => {
//       seatList = shallow(<SeatList
//         user={{ id: 1 }}
//         players={{ white: { id: 2 } }}
//         sitOrStandAs={sitOrStandAs}
//       />);
//     });
//     it('allows the user to sit in an open seat', () => {
//       seatList.find('.btn-black').simulate('click');
//       expect(sitOrStandAs).toHaveBeenCalledWith('black');
//     });
//     it('does not allow the user to sit in an occupied seat', () => {
//       // seatList.find('.btn-white').simulate('click');
//       // expect(sitOrStandAs).not.toHaveBeenCalled();
//       expect(seatList.find('.btn-white')).toHaveProp('disabled', true);
//     });
//   });

//   function createSeatList(props = {}) {
//     return shallow(<SeatList {...props} />);
//     // return ReactTestUtils.renderIntoDocument(<SeatList
//     //         playerColor={props.playerColor || null}
//     //         white={props.white || undefined}
//     //         black={props.black || undefined}
//     //         sitOrStandAs={sitOrStandAs} />);
//   }
//   xit('allows a user to sit in an open seat', () => {
//     // var seatList = createSeatList({ user: });
//     const seatList = shallow(<SeatList sitOrStandAs={sitOrStandAs} />);
//     // let btn = ReactTestUtils.findRenderedDOMComponentWithClass(seatList, 'btn-white');
//     seatList.find('.btn-white').simulate('click');
//     // ReactTestUtils.Simulate.click(btn);
//     expect(sitOrStandAs).toHaveBeenCalled();
//   });

//   xit('allows a player to stand if they are already sitting', () => {
//     var seatList = createSeatList({playerColor: 'white', white: 'Gen'});
//     let btn = ReactTestUtils.findRenderedDOMComponentWithClass(seatList, 'btn-white');
//     ReactTestUtils.Simulate.click(btn);
//     expect(sitOrStandAs).toHaveBeenCalled();
//   });

//   xit('does not allow a user to sit in an occupied seat', () => {
//     var seatList = createSeatList({playerColor: null, white: 'Gen', black: 'Liam'});
//     let btn = ReactTestUtils.findRenderedDOMComponentWithClass(seatList, 'btn-white');
//     ReactTestUtils.Simulate.click(btn);
//     expect(sitOrStandAs).not.toHaveBeenCalled();
//   });

//   xit('does not allow a player to sit in an unoccupied seat', () => {
//     var seatList = createSeatList({playerColor: 'white', white: 'Gen', black: undefined});
//     let btn = ReactTestUtils.findRenderedDOMComponentWithClass(seatList, 'btn-black');
//     ReactTestUtils.Simulate.click(btn);
//     expect(sitOrStandAs).not.toHaveBeenCalled();
//   });
});
