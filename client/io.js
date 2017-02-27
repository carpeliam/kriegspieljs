var client = {};

console.log('io');
var socket = io(location.origin);

var name;

function connect(nickname) {
  name = nickname;
  this.socket.on('connect', function() {
    client.socket.emit('nickname.set', name);
  });
  client.socket.on('room.join', function(room, board) {
    client.room = io.connect(location.origin + room);
    // client.loadBoard(board);
    client.room.emit('nickname.set', name);

    client.room.on('announcement', function(message) {
      publishMessage(message, 'notice');
    });

    client.room.on('speak', function(speaker, message) {
      publishMessage(speaker + ': ' + message);
    });

    client.room.on('room.list', function(nicknames) {
      $('#people').empty();
      for (var i in nicknames) {
        $('#people').append($('<span>').text(nicknames[i]));
      }
    });

    client.room.on('sit', function(color, player) {
      publishMessage(player.nickname + ' sat down as ' + color, 'notice');
      if (player.id == client.socket.id) {
        client.playingAs = color;
        var oppositeColor = (color == 'white') ? 'black' : 'white';
        $('#board a').draggable('option', 'cancel', '.' + oppositeColor).draggable('enable');
        $('#board a.' + oppositeColor).css('display', 'none');
        $('#' + color).text('leave ' + color).siblings('.seat').attr('disabled', true);
      } else {
        $('#' + color).text(color + ': ' + player.nickname).attr('disabled', true);
      }
      if ($('#white').text().indexOf('sit as white') !== 0 && $('#black').text().indexOf('sit as black') !== 0) {
        $('#white').addClass('active');
        publishMessage("Let's get started!", 'notice');
      }
    });

    client.room.on('stand', function(color) {
      publishMessage(color + ' stood up', 'notice');
      var oppositeColor = (color == 'white') ? 'black' : 'white';
      $('#' + color).text('sit as ' + color).attr('disabled', client.playingAs == oppositeColor);
      $('#' + oppositeColor).attr('disabled', client.playingAs != oppositeColor && $('#' + oppositeColor).text().indexOf(oppositeColor) === 0);

      if (client.playingAs == color)
        delete client.playingAs;
    });

    client.room.on('board.move', function(from, to) {
      client.gameInProgress = true;
      var piece = getCell(from.x, from.y).children('a');
      if (piece.size() == 1) {
        getCell(to.x, to.y).children().remove().end().append(piece);
        client.board.move(from.x, from.y, to.x, to.y);
      }
      client.toggleTurn();
      if ($('#' + client.playingAs).hasClass('active')) {
        var pawnCaptures = client.board.pawnCaptures();
        // Depending on the rules we want, we can decide how much
        // information to share.
        // #1. Tell the player only that pawn captures exist.
        // if (pawnCaptures.length > 0) {
        //   publishMessage('There are pawn captures.', 'notice');
        // }
        for (pawn in pawnCaptures) {
          // #2. Tell the player which pawns can make captures.
          publishMessage('The pawn on ' + pawn + ' can make a capture.', 'notice');
          // #3. Tell the player which pawns can capture which squares.
          // publishMessage('The pawn on ' + pawn + ' can capture on ' + pawnCaptures[pawn].join(' and ') + '.', 'notice');
        }
      }
    });

    client.room.on('board.promote', function(square, promotionChoice) {
      client.board.promote(square, promotionChoice);
      client.toggleTurn();
    });

    client.room.on('board.reset', function(board) {
      client.loadBoard(board);
      $('.seat').removeClass('active winning losing');
    });
  });
}
