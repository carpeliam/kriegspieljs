import '../client_helper';
import React from 'react';
import ReactTestUtils from 'react/lib/ReactTestUtils';
import SeatList from '../../client/seat-list';

describe('SeatList', () => {
  var sitOrStandAs;
  beforeEach(() => {
    sitOrStandAs = jasmine.createSpy('sitOrStandAs');
  });
  function createSeatList(props = {}) {
    return ReactTestUtils.renderIntoDocument(<SeatList
            playerColor={props.playerColor || null}
            white={props.white || undefined}
            black={props.black || undefined}
            sitOrStandAs={sitOrStandAs} />);
  }
  it('allows a user to sit in an open seat', () => {
    var seatList = createSeatList();
    let btn = ReactTestUtils.findRenderedDOMComponentWithClass(seatList, 'btn-white');
    ReactTestUtils.Simulate.click(btn);
    expect(sitOrStandAs).toHaveBeenCalled();
  });

  it('allows a player to stand if they are already sitting', () => {
    var seatList = createSeatList({playerColor: 'white', white: 'Gen'});
    let btn = ReactTestUtils.findRenderedDOMComponentWithClass(seatList, 'btn-white');
    ReactTestUtils.Simulate.click(btn);
    expect(sitOrStandAs).toHaveBeenCalled();
  });

  it('does not allow a user to sit in an occupied seat', () => {
    var seatList = createSeatList({playerColor: null, white: 'Gen', black: 'Liam'});
    let btn = ReactTestUtils.findRenderedDOMComponentWithClass(seatList, 'btn-white');
    ReactTestUtils.Simulate.click(btn);
    expect(sitOrStandAs).not.toHaveBeenCalled();
  });
  
  it('does not allow a player to sit in an unoccupied seat', () => {
    var seatList = createSeatList({playerColor: 'white', white: 'Gen', black: undefined});
    let btn = ReactTestUtils.findRenderedDOMComponentWithClass(seatList, 'btn-black');
    ReactTestUtils.Simulate.click(btn);
    expect(sitOrStandAs).not.toHaveBeenCalled();
  });
});
