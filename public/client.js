var Board = require('./board');

$.fn.coordinates = function() {
  var self = $(this[0]);
  if ($('#board td').index(self) == -1) {
    return undefined;
  }
  var x = self.siblings().andSelf().index(self);
  var y = 7 - $('#board tr').index(self.parent());
  return {'x':x, 'y':y};
};

var getCell = function(x, y) {
  return $('#board tr').slice(7 - y, 8 - y).children('td').slice(x, x + 1);
};

function publishMessage(message, className) {
  $('<div></div>').addClass(className).text(message).appendTo($('#chat'));
  var chat = $('#chat')[0];
  var scrollHeight = Math.max(chat.scrollHeight, chat.clientHeight);
  chat.scrollTop = scrollHeight - chat.clientHeight;
}

var client = {
  connect: function(name) {
    this.name = name;
    this.gameInProgress = false;
    this.socket = io.connect();
    this.socket.on('connect', function() {
      client.socket.emit('nickname.set', client.name);
      client.socket.on('room.join', function(room, board) {
        client.room = io.connect(room);
        client.loadBoard(board);
        client.room.emit('nickname.set', client.name);
        
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
          if (player.id == client.socket.socket.sessionid) {
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
          $('#white, #black').toggleClass('active');
        });
        
        client.room.on('board.reset', function(board) {
          client.loadBoard(board);
          $('.seat').removeClass('active winning losing');
        });
      });
    });
  },
  speak: function(message) {
    this.room.emit('speak', message);
    publishMessage(this.name + ': ' + message);
  },
  loadBoard: function(board) {
    // board.__proto__ = Board.prototype; // deprecated
    this.board = new Board({
      onForcedMove: function(xOrig, yOrig, xNew, yNew) {
        var piece = getCell(xOrig, yOrig).children('a');
        var destination = getCell(xNew, yNew);
        piece.appendTo(destination);
      },
      onCheck: function() {
        publishMessage('Check!', 'check');
      },
      onMate: function() {
        client.gameInProgress = false;
        publishMessage('Checkmate.', 'mate');
        $('.active').addClass('winning').siblings('button').addClass('losing');
      }
    });
    for (var prop in board) {
      if (this.board.hasOwnProperty(prop))
        this.board.prop = board.prop;
    }
    $('#board td').each(function() {
      var coords = $(this).coordinates();
      var val = client.board.valueAt(coords.x, coords.y);
      if (val !== 0) {
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
      } else {
        $(this).empty();
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
};

$(document).ready(function() {
  if ($.cookie('handle')) {
    client.connect($.cookie('handle'));
  } else {
    var handleInput = function() {
      if ($('#handle').val() !== '') {
        $.cookie('handle', $('#handle').val());
        client.connect($.cookie('handle'));
        $('#connect').dialog("close");
      }
    };
    $('#connect').dialog({
      modal: true,
      width: 325,
      resizable: false,
      buttons: {
        "Let's go!": handleInput
      }
    }).submit(function() {
      handleInput();
      return false;
    });
  }
  
  $('#msg').submit(function() {
    client.speak($('#chatmsg').val());
    $('#chatmsg').val('');
    return false;
  });
  
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