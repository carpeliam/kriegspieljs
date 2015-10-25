import '../client_helper';

import {Client, Server} from 'mocket-io';

import $ from 'jquery';
import 'jquery.cookie';

import Kriegspiel from '../../client/kriegspiel';


describe('Kriegspiel', () => {
  var server = new Server();
  // TODO no global objects, mock io properly
  window.io = new Client(server);

  it('delegates piece movement to the board', () => {
    var kriegspiel = new Kriegspiel.DecoratedComponent();
    spyOn(kriegspiel.state.board, 'canMove');
    kriegspiel.canDrop({x: 1, y: 1}, {x: 2, y: 2});
    expect(kriegspiel.state.board.canMove).toHaveBeenCalledWith(1, 1, 2, 2);
  });

  it('alerts the room when a piece is moved', () => {
    var kriegspiel = new Kriegspiel.DecoratedComponent();
    spyOn(kriegspiel.room, 'move');
    kriegspiel.drop(/* coords */);
    expect(kriegspiel.room.move).toHaveBeenCalled();
  });

  it('updates the board if a piece movement is successful', () => {
    var kriegspiel = new Kriegspiel.DecoratedComponent();
    spyOn(kriegspiel.room, 'move').and.callFake((origCoords, newCoords, cb) => {
      cb(true);
    });
    spyOn(kriegspiel.state.board, 'move');
    kriegspiel.drop({x: 1, y: 1}, {x: 2, y: 2});
    expect(kriegspiel.state.board.move).toHaveBeenCalled();
  });

  it('does not update the board if a piece movement is unsuccessful', () => {
    var kriegspiel = new Kriegspiel.DecoratedComponent();
    spyOn(kriegspiel.room, 'move').and.callFake((origCoords, newCoords, cb) => {
      cb(false);
    });
    spyOn(kriegspiel.state.board, 'move');

    expect(() => {
      kriegspiel.drop({x: 1, y: 1}, {x: 2, y: 2});
    }).toThrow();
    expect(kriegspiel.state.board.move).not.toHaveBeenCalled();
  });

  describe('with an existing handle cookie', () => {
    beforeEach(() => {
      spyOn($, 'cookie').and.returnValue('jim');
    });
    it('sets the user name in the constructor', () => {
      const component = new Kriegspiel.DecoratedComponent();
      expect(component.state.user).toEqual('jim');
    });
  });
});
