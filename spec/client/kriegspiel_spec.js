import React from 'react';
import { shallow } from 'enzyme';
import KriegspielDragDropContext from '../../client/kriegspiel';
import UserNamePrompter from '../../client/username-prompter';
import Board from '../../client/board';
import SeatList from '../../client/seat-list';
import Room from '../../client/room';
import PawnPromotionPrompter from '../../client/pawn-promotion-prompter';

const Kriegspiel = KriegspielDragDropContext.DecoratedComponent;

describe('Kriegspiel', () => {
  let kriegspiel;
  let setUserSpy;

  beforeEach(() => {
    setUserSpy = jasmine.createSpy('setUser');
    kriegspiel = shallow(
      <Kriegspiel
        user={{ id: 1 }}
        setUser={setUserSpy}
        game={{
          players: { white: 1, black: 2 },
        }}
      />);
  });

  it('passes user to UserNamePrompter', () => {
    const userNamePrompter = kriegspiel.find('UserNamePrompter');
    expect(userNamePrompter).toHaveProp('user', { id: 1 });
  });

  it('passes setUser action to UserNamePrompter', () => {
    const userNamePrompter = kriegspiel.find(UserNamePrompter);
    userNamePrompter.props().onEnter('margaret');
    expect(setUserSpy).toHaveBeenCalledWith('margaret');
  });

  it('passes game state to PawnPromotionPrompter', () => {
    expect(kriegspiel.find(PawnPromotionPrompter)).toBePresent();
  });

  it('contains the board, seat list, and room details', () => {
    expect(kriegspiel.find(Board)).toBePresent();
    expect(kriegspiel.find(SeatList)).toBePresent();
    expect(kriegspiel.find(Room)).toBePresent();
  });


  xdescribe('with an existing handle cookie', () => {
    beforeEach(() => {
      spyOn($, 'cookie').and.returnValue('jim');
      kriegspiel = new Kriegspiel.DecoratedComponent();
    });
    it('sets the user name in the constructor', () => {
      expect(kriegspiel.state.user).toEqual('jim');
    });

    it('delegates piece movement to the board', () => {
      spyOn(kriegspiel.state.board, 'canMove');
      kriegspiel.canDrop({x: 1, y: 1}, {x: 2, y: 2});
      expect(kriegspiel.state.board.canMove).toHaveBeenCalledWith(1, 1, 2, 2);
    });

    it('alerts the room when a piece is moved', () => {
      spyOn(kriegspiel.room, 'move');
      kriegspiel.drop(/* coords */);
      expect(kriegspiel.room.move).toHaveBeenCalled();
    });

    it('updates the board if a piece movement is successful', () => {
      spyOn(kriegspiel, 'setState'); // can't call setState on unmounted component
      spyOn(kriegspiel.room, 'move').and.callFake((origCoords, newCoords, cb) => {
        cb(true);
      });
      spyOn(kriegspiel.state.board, 'move');
      kriegspiel.drop({x: 1, y: 1}, {x: 2, y: 2});
      expect(kriegspiel.state.board.move).toHaveBeenCalled();
    });

    it('does not update the board if a piece movement is unsuccessful', () => {
      spyOn(kriegspiel.room, 'move').and.callFake((origCoords, newCoords, cb) => {
        cb(false);
      });
      spyOn(kriegspiel.state.board, 'move');

      expect(() => {
        kriegspiel.drop({x: 1, y: 1}, {x: 2, y: 2});
      }).toThrow();
      expect(kriegspiel.state.board.move).not.toHaveBeenCalled();
    });

    describe('sitting/standing', () => {
      it('seats the player if not already sitting', () => {
        let seatSpy = spyOn(kriegspiel.room, 'seat');
        kriegspiel.sitOrStandAs('white');
        expect(seatSpy).toHaveBeenCalledWith('jim', 'white');
      });
      it('removes the player from a seat if already sitting', () => {
        kriegspiel.state.playerColor = 'white';
        let standSpy = spyOn(kriegspiel.room, 'stand');
        kriegspiel.sitOrStandAs('white');
        expect(standSpy).toHaveBeenCalled();
      });

      describe('#standPlayer', () => {
        var setStateSpy;
        beforeEach(() => {
          setStateSpy = spyOn(kriegspiel, 'setState');
        });
        it('unsets playingAs for that color', () => {
          kriegspiel.standPlayer('white');
          expect(setStateSpy).toHaveBeenCalledWith({
            playingAs: {white: undefined, black: undefined}
          });
        });
        it('unsets the player color if this client is sat as that color', () => {
          kriegspiel.state.playerColor = 'white';
          kriegspiel.standPlayer('white');
          expect(setStateSpy).toHaveBeenCalledWith({
            playerColor: null,
            playingAs: {white: undefined, black: undefined}
          });
        });
      })
    });

    describe('messages', () => {
      it('logs messages to the server', () => {
        spyOn(kriegspiel.room, 'logMessage');
        kriegspiel.speak('Jolly good move, sir');
        expect(kriegspiel.room.logMessage).toHaveBeenCalledWith('Jolly good move, sir');
      });
      it('acts on messages from the server', () => {
        let setStateSpy = spyOn(kriegspiel, 'setState');
        expect(kriegspiel.state.messages).toEqual([]);
        kriegspiel.logMessage('Jolly good move, sir');
        expect(setStateSpy).toHaveBeenCalledWith({
          messages: ['Jolly good move, sir']
        });
      });
    });
  });
});
