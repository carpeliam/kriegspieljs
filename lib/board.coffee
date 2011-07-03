_ = require 'underscore'

class Board
  # FIXME what's the best way to share these values?
  UNOCCUPIED = 0
  WHITE = 1
  BLACK = -1
  PAWN = 1
  KNIGHT = 2
  BISHOP = 3
  ROOK = 4
  QUEEN = 5
  KING = 6
  constructor: ->
    @squares = []
    @squares[i] = [] for i in [0..8]
    @init()
    
  init: ->
    @squares[0][0] = @squares[7][0] = WHITE*ROOK
    @squares[1][0] = @squares[6][0] = WHITE*KNIGHT
    @squares[2][0] = @squares[5][0] = WHITE*BISHOP
    @squares[3][0] = WHITE*QUEEN
    @squares[4][0] = WHITE*KING
    @squares[i][1] = WHITE*PAWN for i in [0...8]
    @squares[0][7] = @squares[7][7] = BLACK*ROOK
    @squares[1][7] = @squares[6][7] = BLACK*KNIGHT
    @squares[2][7] = @squares[5][7] = BLACK*BISHOP
    @squares[3][7] = BLACK*QUEEN
    @squares[4][7] = BLACK*KING
    @squares[i][6] = BLACK*PAWN for i in [0...8]
    for y in [2...6]
      @squares[x][y] = UNOCCUPIED for x in [0...8]
    
    @hasMoved = []
    @hasMoved[WHITE] = king: false, kingsRook: false, queensRook: false
    @hasMoved[BLACK] = king: false, kingsRook: false, queensRook: false
    
    @turn = WHITE
    
  valueAt: (x,y) ->
    @squares[x][y]
  
  pieceType: (x, y) ->
    return undefined if @valueAt(x, y) == UNOCCUPIED
    Math.abs(@valueAt(x, y))
  
  color: (x, y) ->
    return undefined if @valueAt(x, y) == UNOCCUPIED
    @valueAt(x, y) / Math.abs(@valueAt(x, y))
  
  moveResultsInCheck: (xOrig, yOrig, xNew, yNew) ->
    newSquareValue = @valueAt(xNew, yNew)
    @forceMove(xOrig, yOrig, xNew, yNew)
    inCheck = false
    @squares[xOrig][yOrig] = @valueAt(xNew, yNew)
    @squares[xNew][yNew] = newSquareValue
    inCheck
  
  passesOverPieces: (xOrig, yOrig, xNew, yNew) ->
    xDelta = xNew - xOrig
    yDelta = yNew - yOrig
    xDelta /= Math.abs(xDelta) unless xDelta is 0
    yDelta /= Math.abs(yDelta) unless yDelta is 0
    x = xOrig + xDelta
    y = yOrig + yDelta
    
    while x isnt xNew or y isnt yNew
      return true if @valueAt(x, y) isnt UNOCCUPIED
      x += xDelta; y += yDelta
    return false
  
  canMove: (xOrig, yOrig, xNew, yNew) ->
    return false if !@squares[xNew]? or !@squares[xNew][yNew]?
    color = @color(xOrig, yOrig)
    return false if color != @turn or color == @color(xNew, yNew)
    return false if @moveResultsInCheck(xOrig, yOrig, xNew, yNew)
    switch @pieceType(xOrig, yOrig)
      when PAWN
        onHomeRow = if color is WHITE then (yOrig == 1) else (yOrig == 6)
        if xOrig == xNew # moving
          maxMovement = if onHomeRow then 2 else 1
          return false if color * (yNew - yOrig) > maxMovement
          return false if @valueAt(xNew, yNew) isnt UNOCCUPIED
          return false if @passesOverPieces(xOrig, yOrig, xNew, yNew)
        else # capturing
          # TODO account for en passant
          return false if Math.abs(xNew - xOrig) > 1
          return false if color * (yNew - yOrig) > 1
          return false if @color(xNew, yNew) != -color
      when KNIGHT
        return false unless (Math.abs(xNew - xOrig) == 2 and Math.abs(yNew - yOrig) == 1) or
          (Math.abs(xNew - xOrig) == 1 and Math.abs(yNew - yOrig) == 2)
      when BISHOP
        return false if Math.abs(xNew - xOrig) != Math.abs(yNew - yOrig)
        return false if @passesOverPieces(xOrig, yOrig, xNew, yNew)
      when ROOK
        return false if xNew != xOrig and yNew != yOrig
        return false if @passesOverPieces(xOrig, yOrig, xNew, yNew)
      when QUEEN
        return false if (Math.abs(xNew - xOrig) != Math.abs(yNew - yOrig)) and
          (xNew != xOrig and yNew != yOrig)
        return false if @passesOverPieces(xOrig, yOrig, xNew, yNew)
      when KING
        # TODO handle castling
        backRow = if color is WHITE then 0 else 7
        if !@hasMoved[color].king and yNew == backRow
          if xNew - xOrig == 2
            return !@passesOverPieces(xOrig, yOrig, xNew, yNew)
          else if xOrig - xNew == 2
            return !@passesOverPieces(xOrig, yOrig, xNew, yNew)
        return false if Math.abs(xNew - xOrig) != 1 and Math.abs(yNew - yOrig) != 1
    true
  
  forceMove: (xOrig, yOrig, xNew, yNew) ->
    @squares[xNew][yNew] = @squares[xOrig][yOrig]
    @squares[xOrig][yOrig] = UNOCCUPIED
    # TODO handle pawn advancement, castling, check/mate
    true
  
  move: (xOrig, yOrig, xNew, yNew) ->
    moved = @canMove(xOrig, yOrig, xNew, yNew) && @forceMove(xOrig, yOrig, xNew, yNew)
    if moved
      # advance turn
      @turn *= -1
      # keep track of king/rook movement for any future castling
      color = @color(xNew, yNew)
      backRow = if color is WHITE then 0 else 7
      switch @pieceType(xNew, yNew)
        when ROOK
          @hasMoved[color].queensRook = true if xOrig == 0 and yOrig == backRow
          @hasMoved[color].kingsRook  = true if xOrig == 7 and yOrig == backRow
        when KING
          if !@hasMoved[color].king
            if xNew - xOrig == 2
              @forceMove(7, backRow, 5, backRow)
            else if xOrig - xNew == 2
              @forceMove(0, backRow, 3, backRow)
          @hasMoved[color].king = true
    return moved

module.exports = Board