import '../client_helper';
import React from 'react';
import SeatList from '../../client/seat-list';

describe('SeatList', () => {
  it('allows a user to sit in an open seat');
  it('allows a player to stand if they are already sitting');
  it('does not allow a user to sit in an occupied seat');
  it('does not allow a player to sit in an unoccupied seat');
});
