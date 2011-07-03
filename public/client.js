var Board = require('./board');

$.fn.coordinates = function() {
  var self = $(this[0]);
  if ($('#board td').index(self) == -1) {
    return undefined;
  }
  var x = self.siblings().andSelf().index(self);
  var y = 7 - $('#board tr').index(self.parent());
  return {'x':x, 'y':y};
}

var getCell = function(x, y) {
  return $('#board tr').slice(7 - y, 8 - y).children('td').slice(x, x + 1);
}

var client = {
  connect: function(name) {
    this.name = name;
    this.socket = io.connect();
    this.socket.on('connect', function() {
      client.socket.emit('nickname.set', client.name);
      client.socket.on('room.join', function(room, board) {
        client.room = io.connect(room);
        client.loadBoard(board);
        client.room.emit('nickname.set', client.name);
        client.room.on('room.list', function(list) {
          // console.log('-> room.list', list);
        });
        client.room.on('sit', function(color, player) {
          if (player.id == client.socket.socket.sessionid) {
            client.playingAs = color;
            var oppositeColor = (color == 'white') ? 'black' : 'white';
            $('#board a').draggable('option', 'cancel', '.' + oppositeColor).draggable('enable');
            $('#' + color).text('leave ' + color).siblings('.seat').attr('disabled', true);
          } else {
            $('#' + color).text(color + ': ' + player.nickname).attr('disabled', true);
          }
        });
        client.room.on('stand', function(color) {
          if (client.playingAs == color)
            delete client.playingAs;
          $('#' + color).text('sit as ' + color);
          $('.seat').each(function() {
            $(this).attr('disabled', client.playingAs == $(this).attr('id'));
          });
        });
        client.room.on('board.move', function(from, to) {
          var piece = getCell(from.x, from.y).children('a');
          if (piece.size() == 1) {
            getCell(to.x, to.y).children().remove().end().append(piece);
            client.board.move(from.x, from.y, to.x, to.y);
          }
        });
      });
    });
  },
  loadBoard: function(board) {
    // board.__proto__ = Board.prototype; // deprecated
    this.board = new Board({onForcedMove: function(xOrig, yOrig, xNew, yNew) {
      var piece = getCell(xOrig, yOrig).children('a');
      var destination = getCell(xNew, yNew);
      piece.appendTo(destination);
    }});
    for (prop in board) {
      if (this.board.hasOwnProperty(prop))
        this.board.prop = board.prop;
    }
    $('#board td').each(function() {
      var coords = $(this).coordinates();
      var val = client.board.valueAt(coords.x, coords.y);
      if (val != 0) {
        var link = $('<a href="#"></a>');
        var isWhite = val > 0;
        link.addClass(isWhite ? 'white' : 'black');
        switch (client.board.pieceType(coords.x, coords.y)) {
          case 1: // PAWN
            link.addClass('pawn');
            link.html(isWhite ? '&#9817;' : '&#9823;');
            break;
          case 2: // KNIGHT
            link.addClass('knight');
            link.html(isWhite ? '&#9816;' : '&#9822;');
            break;
          case 3: // BISHOP
            link.addClass('bishop');
            link.html(isWhite ? '&#9815;' : '&#9821;');
            break;
          case 4: // ROOK
            link.addClass('rook');
            link.html(isWhite ? '&#9814;' : '&#9820;');
            break;
          case 5: // QUEEN
            link.addClass('queen');
            link.html(isWhite ? '&#9813;' : '&#9819;');
            break;
          case 6: // KING
            link.addClass('king');
            link.html(isWhite ? '&#9812;' : '&#9818;');
        }
        $(this).empty().append(link);
      }
    });
    $('#board a').draggable({
      disabled: true,
      containment: $('#board'),
      grid: [80, 80],
      zIndex: 1000,
      opacity: 0.4,
      revert: 'invalid',
      stop: function(event, ui) {
        $(this).removeAttr('style');
      }
    });
  },
  sitAs: function(color) {
    this.room.emit('sit', color);
  },
  standAs: function(color) {
    this.room.emit('stand', color);
  }
}

$(document).ready(function() {
  if ($.cookie('handle')) {
    client.connect($.cookie('handle'));
  } else {
    $('#connect').dialog({
      modal: true,
      width: 325,
      resizable: false,
      buttons: {
        "Let's go!": function() {
          if ($('#handle').val() != '') {
            $.cookie('handle', $('#handle').val());
            client.connect($.cookie('handle'));
            $(this).dialog("close");
          }
          
        }
      }
    });
  }
  
  $('.seat').click(function() {
    var color = $(this).attr('id');
    if (client.playingAs == color) {
      client.standAs(color);
    } else {
      client.sitAs(color);
    }
  });
  
  $('#board td').droppable({
    accept: function(draggable) {
      var from = draggable.parent().coordinates();
      var to = $(this).coordinates();
      return client.board.canMove(from.x, from.y, to.x, to.y);
    },
    drop: function(event, ui) {
      var tile = $(this);
      var from = ui.draggable.parent().coordinates();
      var to = tile.coordinates();
      client.room.emit('board.move', from, to, function(success) {
        if (success) {
          client.board.move(from.x, from.y, to.x, to.y);
          tile.children().remove().end().append(ui.draggable);
        }
      });
    }
  });
});