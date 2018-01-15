import React from 'react';
import Board from './board';
import SeatList from './seat-list';
import Room from './room';
import UserNamePrompter from './username-prompter';
import PawnPromotionPrompter from './pawn-promotion-prompter';

export default function Kriegspiel() {
  return (
    <div style={{display: 'flex'}}>
      <main>
        <Board />
      </main>
      <aside style={{ marginLeft: 8 }}>
        <SeatList />
        <Room />
      </aside>
      <UserNamePrompter />
      <PawnPromotionPrompter />
    </div>
  );
}
