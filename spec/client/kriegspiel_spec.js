import React from 'react';
import { shallow } from 'enzyme';
import Kriegspiel from '../../client/kriegspiel';
import UserNamePrompter from '../../client/username-prompter';
import Board from '../../client/board';
import SeatList from '../../client/seat-list';
import Room from '../../client/room';
import PawnPromotionPrompter from '../../client/pawn-promotion-prompter';

describe('Kriegspiel', () => {
  let kriegspiel;

  beforeEach(() => {
    kriegspiel = shallow(<Kriegspiel />);
  });

  it('contains sub components', () => {
    expect(kriegspiel.find(Board)).toBePresent();
    expect(kriegspiel.find(SeatList)).toBePresent();
    expect(kriegspiel.find(Room)).toBePresent();
    expect(kriegspiel.find(PawnPromotionPrompter)).toBePresent();
    expect(kriegspiel.find(UserNamePrompter)).toBePresent();
  });
});
