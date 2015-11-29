import $ from 'jquery';
import 'jquery.cookie';

import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Square from './square';
import Piece from './piece';
import SeatList from './seat-list';
import RoomList from './room-list';
import MessageLog from './message-log';
import BoardCommunicator from './board-communicator';
import UserNamePrompter from './username-prompter';

import Board from '../lib/board.coffee';

class Kriegspiel extends React.Component {
  constructor() {
    super();
    this.state = {
      board: new Board(),
      user: $.cookie('handle'),
      members: [],
      messages: [],
      playerColor: null,
      playingAs: {white: undefined, black: undefined}
    };
    this.room = new BoardCommunicator(io, {
      onBoardUpdate: this.updateBoard.bind(this),
      onRoomUpdate: this.updateRoomList.bind(this),
      onRemoteMove: this.processMove.bind(this),
      onPlayerSit: this.seatPlayer.bind(this),
      onPlayerStand: this.standPlayer.bind(this),
      onLogMessage: this.logMessage.bind(this)
    });
    if (this.state.user) {
      this.room.connectAs(this.state.user);
    }
  }
  renderPiece(x, y) {
    let pieceType = this.state.board.pieceType(x, y);
    if (pieceType) {
      return <Piece pieceType={pieceType} x={x} y={y} color={this.state.board.color(x, y)} canDrag={this.canMove.bind(this)} />
    }
  }
  canMove(color) {
    return color === this.state.board.turn;
  }
  canDrop(origCoords, newCoords) {
    return this.state.board.canMove(origCoords.x, origCoords.y, newCoords.x, newCoords.y);
  }
  drop(origCoords, newCoords) {
    this.room.move(origCoords, newCoords, (success) => {
      if (success) {
        this.processMove(origCoords, newCoords);
      } else {
        // TODO handle me
        throw 'failed to move';
      }
    });
  }
  processMove(origCoords, newCoords) {
    this.state.board.move(origCoords.x, origCoords.y, newCoords.x, newCoords.y);
    this.setState({board: this.state.board});
  }
  seatPlayer(player, color, isCurrentClient) {
    let playerState = {playingAs: this.state.playingAs}
    playerState.playingAs[color] = player.name;
    if (isCurrentClient) {
      playerState.playerColor = color;
    }
    this.setState(playerState);
  }
  standPlayer(color) {
    let playerState = {playingAs: this.state.playingAs};
    playerState.playingAs[color] = undefined;
    if (color === this.state.playerColor) {
      playerState.playerColor = null;
    }
    this.setState(playerState);
  }
  logMessage(msg) {
    let messages = [...this.state.messages, msg];
    this.setState({messages});
  }
  speak(msg) {
    this.room.logMessage(msg);
  }
  logIn(name) {
    $.cookie('handle', name);
    this.setState({user: name});
    this.room.connectAs(name);
  }
  updateBoard(newBoard) {
    for (var prop in newBoard) {
      if (this.state.board.hasOwnProperty(prop))
        this.state.board[prop] = newBoard[prop];
    }
    this.setState({board: this.state.board});
  }
  updateRoomList(members) {
    this.setState({members: members});
  }
  sitOrStandAs(color) {
    if (this.state.playerColor) {
      this.room.stand();
    } else {
      this.room.seat(this.state.user, color);
    }
  }
  render() {
    return <div className="row">
      <div className="board col-md-8">
        {[7,6,5,4,3,2,1,0].map((y) =>
          [0,1,2,3,4,5,6,7].map((x) =>
            <Square x={x} y={y} canDrop={this.canDrop.bind(this)} drop={this.drop.bind(this)}>
              {this.renderPiece(x, y)}
            </Square>
          )
        )}
      </div>

      <div className="col-md-4">
        <SeatList playerColor={this.state.playerColor}
                  white={this.state.playingAs.white}
                  black={this.state.playingAs.black}
                  sitOrStandAs={this.sitOrStandAs.bind(this)} />

        <RoomList members={this.state.members} />
        <MessageLog messages={this.state.messages} onMessageSubmit={this.speak.bind(this)} />
      </div>
      
      <UserNamePrompter user={this.state.user} onEnter={this.logIn.bind(this)} />
    </div>;
  }
}

export default DragDropContext(HTML5Backend)(Kriegspiel);
