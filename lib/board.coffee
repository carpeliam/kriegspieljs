_ = require 'underscore'

class Board
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
    
    @turn = WHITE
    @whiteHasCastled = @blackHasCastled = false
    
  value: (x,y) ->
    @squares[x][y]
  
  pieceType: (x, y) ->
    return undefined if @value(x, y) == UNOCCUPIED
    Math.abs(@value(x, y))
  
  color: (x, y) ->
    return undefined if @value(x, y) == UNOCCUPIED
    @value(x, y) / Math.abs(@value(x, y))
  
  moveResultsInCheck: (xOrig, yOrig, xNew, yNew) ->
    newSquareValue = @value(xNew, yNew)
    @forceMove(xOrig, yOrig, xNew, yNew)
    inCheck = false
    @squares[xOrig][yOrig] = @value(xNew, yNew)
    @squares[xNew][yNew] = newSquareValue
    inCheck
  
  passesOverPieces: (xOrig, yOrig, xNew, yNew) ->
    xDelta = xNew - xOrig
    xRatio = if xDelta is 0 then 0 else xDelta / Math.abs(xDelta)
    yDelta = yNew - yOrig
    yRatio = if yDelta is 0 then 0 else yDelta / Math.abs(yDelta)
    
    x = xOrig# + xRatio
    y = yOrig# + yRatio
    while x < xNew or y < yNew
      x += xRatio
      y += yRatio
      return true if @value(x, y) isnt UNOCCUPIED
    # for x in [xOrig + xRatio...xNew] by xRatio
    #   for y in [yOrig + yRatio...yNew] by yRatio
    #     return true if @value(x, y) isnt UNOCCUPIED
    return false
  
  canMove: (xOrig, yOrig, xNew, yNew) ->
    return false if !@squares[xNew]? or !@squares[xNew][yNew]?
    color = @color(xOrig, yOrig)
    return false if color == @color(xNew, yNew)
    return false if @moveResultsInCheck(xOrig, yOrig, xNew, yNew)
    switch @pieceType(xOrig, yOrig)
      when PAWN
        onHomeRow = if color == WHITE then (yOrig == 1) else (yOrig == 6)
        if xOrig == xNew # moving
          maxMovement = if onHomeRow then 2 else 1
          return false if color * (yNew - yOrig) > maxMovement
          return false if @value(xNew, yNew) isnt UNOCCUPIED
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
        return false if Math.abs(xNew - xOrig) != 1 and Math.abs(yNew - yOrig) != 1
    true
  
  forceMove: (xOrig, yOrig, xNew, yNew) ->
    @squares[xNew][yNew] = @squares[xOrig][yOrig]
    @squares[xOrig][yOrig] = UNOCCUPIED
    # TODO handle pawn advancement, castling, check/mate
    @turn *= -1 # advance turn
    true
  
  move: (xOrig, yOrig, xNew, yNew) ->
    @canMove(xOrig, yOrig, xNew, yNew) && @forceMove(xOrig, yOrig, xNew, yNew)

module.exports = Board