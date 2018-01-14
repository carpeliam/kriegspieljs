import React from 'react';
import Board from './board';
import SeatList from './seat-list';
import Room from './room';
import UserNamePrompter from './username-prompter';
import PawnPromotionPrompter from './pawn-promotion-prompter';

export default function Kriegspiel() {
  return (
    <div>
      <Board />
      <SeatList />
      <Room />
      <UserNamePrompter />
      <PawnPromotionPrompter />
    </div>
  );
}
