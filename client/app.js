import React from 'react';
import ReactDOM from 'react-dom';
import Kriegspiel from './kriegspiel';

import './style/index.scss';

ReactDOM.render(<Kriegspiel/>, document.getElementById('game'));

// return;
// TODO delete everything below as soon as migration is done
// $.fn.coordinates = function() {
//   var self = $(this[0]);
//   if ($('#board td').index(self) == -1) {
//     return undefined;
//   }
//   var x = self.siblings().andSelf().index(self);
//   var y = 7 - $('#board tr').index(self.parent());
//   return {'x':x, 'y':y};
// };

// var getCell = function(x, y) {
//   return $('#board tr').slice(7 - y, 8 - y).children('td').slice(x, x + 1);
// };

// function publishMessage(message, className) {
//   $('<div></div>').addClass(className).text(message).appendTo($('#chat'));
//   var chat = $('#chat')[0];
//   var scrollHeight = Math.max(chat.scrollHeight, chat.clientHeight);
//   chat.scrollTop = scrollHeight - chat.clientHeight;
// }

// var client = {
//   connect: function(name) {
//     this.name = name;
//     this.gameInProgress = false;
//     this.socket = io(location.origin);
//     this.socket.on('connect', function() {
//       client.socket.emit('nickname.set', client.name);
//       client.socket.on('room.join', function(room, board) {
//         client.room = io.connect(location.origin + room);
//         client.loadBoard(board);
//         client.room.emit('nickname.set', client.name);

//         client.room.on('announcement', function(message) {
//           publishMessage(message, 'notice');
//         });

//         client.room.on('speak', function(speaker, message) {
//           publishMessage(speaker + ': ' + message);
//         });

//         client.room.on('room.list', function(nicknames) {
//           $('#people').empty();
//           for (var i in nicknames) {
//             $('#people').append($('<span>').text(nicknames[i]));
//           }
//         });

//         client.room.on('sit', function(color, player) {
//           publishMessage(player.nickname + ' sat down as ' + color, 'notice');
//           if (player.id == client.socket.id) {
//             client.playingAs = color;
//             var oppositeColor = (color == 'white') ? 'black' : 'white';
//             $('#board a').draggable('option', 'cancel', '.' + oppositeColor).draggable('enable');
//             $('#board a.' + oppositeColor).css('display', 'none');
//             $('#' + color).text('leave ' + color).siblings('.seat').attr('disabled', true);
//           } else {
//             $('#' + color).text(color + ': ' + player.nickname).attr('disabled', true);
//           }
//           if ($('#white').text().indexOf('sit as white') !== 0 && $('#black').text().indexOf('sit as black') !== 0) {
//             $('#white').addClass('active');
//             publishMessage("Let's get started!", 'notice');
//           }
//         });

//         client.room.on('stand', function(color) {
//           publishMessage(color + ' stood up', 'notice');
//           var oppositeColor = (color == 'white') ? 'black' : 'white';
//           $('#' + color).text('sit as ' + color).attr('disabled', client.playingAs == oppositeColor);
//           $('#' + oppositeColor).attr('disabled', client.playingAs != oppositeColor && $('#' + oppositeColor).text().indexOf(oppositeColor) === 0);

//           if (client.playingAs == color)
//             delete client.playingAs;
//         });

//         client.room.on('board.move', function(from, to) {
//           client.gameInProgress = true;
//           var piece = getCell(from.x, from.y).children('a');
//           if (piece.size() == 1) {
//             getCell(to.x, to.y).children().remove().end().append(piece);
//             client.board.move(from.x, from.y, to.x, to.y);
//           }
//           client.toggleTurn();
//           if ($('#' + client.playingAs).hasClass('active')) {
//             var pawnCaptures = client.board.pawnCaptures();
//             // Depending on the rules we want, we can decide how much
//             // information to share.
//             // #1. Tell the player only that pawn captures exist.
//             // if (pawnCaptures.length > 0) {
//             //   publishMessage('There are pawn captures.', 'notice');
//             // }
//             for (pawn in pawnCaptures) {
//               // #2. Tell the player which pawns can make captures.
//               publishMessage('The pawn on ' + pawn + ' can make a capture.', 'notice');
//               // #3. Tell the player which pawns can capture which squares.
//               // publishMessage('The pawn on ' + pawn + ' can capture on ' + pawnCaptures[pawn].join(' and ') + '.', 'notice');
//             }
//           }
//         });

//         client.room.on('board.promote', function(square, promotionChoice) {
//           client.board.promote(square, promotionChoice);
//           client.toggleTurn();
//         });

//         client.room.on('board.reset', function(board) {
//           client.loadBoard(board);
//           $('.seat').removeClass('active winning losing');
//         });
//       });
//     });
//   },
//   speak: function(message) {
//     this.room.emit('speak', message);
//     publishMessage(this.name + ': ' + message);
//   },
//   toggleTurn: function() {
//     if (this.board.turn == 1) {
//       $('#white').addClass('active');
//       $('#black').removeClass('active');
//     } else {
//       $('#white').removeClass('active');
//       $('#black').addClass('active');
//     }
//   },
//   loadBoard: function(board) {
//     // board.__proto__ = Board.prototype; // deprecated
//     var assignPieceToSquare = function(coords, $square) {
//       var pieceType = client.board.pieceType(coords.x, coords.y),
//           value = client.board.valueAt(coords.x, coords.y),
//           isWhite = value > 0;
//       switch (pieceType) {
//         case 1: // PAWN
//           $square.addClass('pawn');
//           $square.html(isWhite ? '&#9817;' : '&#9823;');
//           break;
//         case 2: // KNIGHT
//           $square.addClass('knight');
//           $square.html(isWhite ? '&#9816;' : '&#9822;');
//           break;
//         case 3: // BISHOP
//           $square.addClass('bishop');
//           $square.html(isWhite ? '&#9815;' : '&#9821;');
//           break;
//         case 4: // ROOK
//           $square.addClass('rook');
//           $square.html(isWhite ? '&#9814;' : '&#9820;');
//           break;
//         case 5: // QUEEN
//           $square.addClass('queen');
//           $square.html(isWhite ? '&#9813;' : '&#9819;');
//           break;
//         case 6: // KING
//           $square.addClass('king');
//           $square.html(isWhite ? '&#9812;' : '&#9818;');
//       }
//     };
//     this.board = new Board({
//       onForcedMove: function(xOrig, yOrig, xNew, yNew) {
//         var piece = getCell(xOrig, yOrig).children('a');
//         var destination = getCell(xNew, yNew);
//         piece.appendTo(destination);
//       },
//       onCheck: function() {
//         publishMessage('Check!', 'check');
//       },
//       onMate: function() {
//         client.gameInProgress = false;
//         publishMessage('Checkmate.', 'mate');
//         $('.active').addClass('winning').siblings('button').addClass('losing');
//       },
//       onAdvancement: function(x, y) {
//         var sqColor = client.board.color(x, y),
//             isCurrentPlayer = client.playingAs == 'white' ? sqColor == 1 : sqColor == -1;
//         if (isCurrentPlayer) {
//           var handlePromotion = function() {
//             var choice = parseInt($('#promotion_choice').val());
//             client.room.emit('board.promote', {x: x, y: y}, choice);
//             // $('#promotion').dialog("close");
//           };
//           // $('#promotion').dialog({
//           //   modal: true,
//           //   width: 325,
//           //   resizable: false,
//           //   buttons: {
//           //     "Promote": handlePromotion
//           //   }
//           // }).submit(function() {
//           //   handlePromotion();
//           //   return false;
//           // });
//         }
//       },
//       onPromotion: function(x, y, choice) {
//         assignPieceToSquare({x: x, y: y}, getCell(x, y).children('a'));
//       }
//     });
//     for (var prop in board) {
//       if (this.board.hasOwnProperty(prop))
//         this.board[prop] = board[prop];
//     }
//     $('#board td').each(function() {
//       var coords = $(this).coordinates();
//       var val = client.board.valueAt(coords.x, coords.y);
//       if (val !== 0) {
//         var link = $('<a href="#"></a>');
//         var isWhite = val > 0;
//         link.addClass(isWhite ? 'white' : 'black');
//         assignPieceToSquare(coords, link);
//         $(this).empty().append(link);
//       } else {
//         $(this).empty();
//       }
//     });
//     $('#board a').draggable({
//       disabled: true,
//       containment: $('#board'),
//       grid: [80, 80],
//       zIndex: 1000,
//       opacity: 0.4,
//       revert: 'invalid',
//       stop: function(event, ui) {
//         $(this).removeAttr('style');
//       }
//     });
//   },
//   sitAs: function(color) {
//     this.room.emit('sit', color);
//   },
//   standAs: function(color) {
//     this.room.emit('stand', color);
//   }
// };

// $(document).ready(function() {
//   if ($.cookie('handle')) {
//     client.connect($.cookie('handle'));
//   } else {
//     var handleInput = function() {
//       if ($('#handle').val() !== '') {
//         $.cookie('handle', $('#handle').val());
//         client.connect($.cookie('handle'));
//         // $('#connect').dialog("close");
//       }
//     };
//     // $('#connect').dialog({
//     //   modal: true,
//     //   width: 325,
//     //   resizable: false,
//     //   buttons: {
//     //     "Let's go!": handleInput
//     //   }
//     // }).submit(function() {
//     //   handleInput();
//     //   return false;
//     // });
//   }

//   $('#msg').submit(function() {
//     client.speak($('#chatmsg').val());
//     $('#chatmsg').val('');
//     return false;
//   });

//   $('.seat').click(function() {
//     var color = $(this).attr('id');
//     if (client.playingAs == color) {
//       client.standAs(color);
//     } else {
//       client.sitAs(color);
//     }
//   });

//   // $('#board td').droppable({
//   //   accept: function(draggable) {
//   //     var from = draggable.parent().coordinates();
//   //     var to = $(this).coordinates();
//   //     return client.board.canMove(from.x, from.y, to.x, to.y);
//   //   },
//   //   drop: function(event, ui) {
//   //     var tile = $(this);
//   //     var from = ui.draggable.parent().coordinates();
//   //     var to = tile.coordinates();
//   //     client.room.emit('board.move', from, to, function(success) {
//   //       if (success) {
//   //         client.board.move(from.x, from.y, to.x, to.y);
//   //         tile.children().remove().end().append(ui.draggable);
//   //       }
//   //     });
//   //   }
//   // });
// });
