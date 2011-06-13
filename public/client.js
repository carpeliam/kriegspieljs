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

$(document).ready(function() {
  var board = new Board();
  
  $('#board a').draggable({
    containment: $('#board'),
    grid: [80, 80],
    zIndex: 1000,
    opacity: 0.4,
    revert: 'invalid',
    stop: function(event, ui) {
      $(this).removeAttr('style');
    }
  });
  
  $('#board td').droppable({
    accept: function(draggable) {
      var from = draggable.parent().coordinates();
      var to = $(this).coordinates();
      return board.canMove(from.x, from.y, to.x, to.y);
    },
    drop: function(event, ui) {
      var from = ui.draggable.parent().coordinates();
      var to = $(this).coordinates();
      board.move(from.x, from.y, to.x, to.y);
      $(this).children().remove().end().append(ui.draggable);
    }
  });
});