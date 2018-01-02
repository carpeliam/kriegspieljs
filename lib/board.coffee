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
  constructor: (@options = {}) ->
    if @options.gameState
      @loadState @options.gameState
    else
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

    @hasMoved = {}
    @hasMoved[WHITE] = king: false, kingsRook: false, queensRook: false
    @hasMoved[BLACK] = king: false, kingsRook: false, queensRook: false

    @turn = WHITE

  loadState: (state) ->
    @squares = state.squares
    @hasMoved = state.hasMoved
    @turn = state.turn

  valueAt: (x,y) ->
    @squares[x][y]

  algebraicNotationFor: (x,y) ->
    "#{['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][x]}#{y + 1}"

  findPiece: (value) ->
    for x in [0..7]
      for y in [0..7]
        return [x, y] if @valueAt(x, y) is value

  findPieces: (value) ->
    pieces = []
    for x in [0..7]
      for y in [0..7]
        pieces.push('x':x, 'y':y) if @valueAt(x, y) is value
    return pieces

  pawnCaptures: ->
    captures = {}
    for pawn in @findPieces(@turn * PAWN)
      spaces = []
      spaces.push @algebraicNotationFor(pawn.x - 1, pawn.y + @turn) if @canMove(pawn.x, pawn.y, pawn.x - 1, pawn.y + @turn)
      spaces.push @algebraicNotationFor(pawn.x + 1, pawn.y + @turn) if @canMove(pawn.x, pawn.y, pawn.x + 1, pawn.y + @turn)
      captures[@algebraicNotationFor(pawn.x, pawn.y)] = spaces if spaces.length isnt 0
    return captures

  pieceType: (x, y) ->
    return undefined if @valueAt(x, y) == UNOCCUPIED
    Math.abs(@valueAt(x, y))

  color: (x, y) ->
    return undefined if @valueAt(x, y) == UNOCCUPIED
    @valueAt(x, y) / Math.abs(@valueAt(x, y))

  gameState: ->
    state = {squares: []}
    state.squares[x] = [@squares[x]...] for x in [0..7]
    state.hasMoved =
      "#{WHITE}": king: @hasMoved[WHITE].king, kingsRook: @hasMoved[WHITE].kingsRook, queensRook: @hasMoved[WHITE].queensRook
      "#{BLACK}": king: @hasMoved[BLACK].king, kingsRook: @hasMoved[BLACK].kingsRook, queensRook: @hasMoved[BLACK].queensRook
    state.turn = @turn
    state

  # forces a given move, detects if a check exists, and then undoes the move
  moveResultsInCheck: (xOrig, yOrig, xNew, yNew) ->
    # make sure we don't recurse
    return [] if @alreadyLookingForCheck?
    @alreadyLookingForCheck = true

    newSquareValue = @valueAt xNew, yNew
    @forceMove xOrig, yOrig, xNew, yNew

    [xKing, yKing] = @findPiece(@color(xNew, yNew) * KING)

    @turn *= -1

    pieces = []
    for x in [0..7] # brute force, check all squares (could be improved)
      for y in [0..7]
        pieces.push([x, y]) if @canMove(x, y, xKing, yKing)

    # reset
    @squares[xOrig][yOrig] = @valueAt xNew, yNew
    @squares[xNew][yNew] = newSquareValue
    @turn *= -1
    delete @alreadyLookingForCheck
    pieces

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
    return false if color != @turn or color is @color(xNew, yNew)
    return false if @moveResultsInCheck(xOrig, yOrig, xNew, yNew).length > 0
    switch @pieceType(xOrig, yOrig)
      when PAWN
        onHomeRow = if color is WHITE then (yOrig == 1) else (yOrig == 6)
        if xOrig == xNew # moving
          maxMovement = if onHomeRow then 2 else 1
          return false unless 0 < color * (yNew - yOrig) <= maxMovement
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
        # TODO handle castling into/out of/through check
        homeRow = if color is WHITE then 0 else 7
        if !@hasMoved[color].king and yNew == homeRow
          castleSafeFromCheck = =>
            for x in [xOrig..xNew]
              return false if @moveResultsInCheck(xOrig, yOrig, x, yOrig).length > 0
            return true
          if xNew - xOrig == 2 and !@hasMoved[color].kingsRook # castling king-side
            return !@passesOverPieces(xOrig, yOrig, xNew, yNew) and castleSafeFromCheck()
          else if xOrig - xNew == 2 and !@hasMoved[color].queensRook # castling queen-side
            return !@passesOverPieces(xOrig, yOrig, xNew, yNew) and castleSafeFromCheck()
        return false if Math.abs(xNew - xOrig) > 1 or Math.abs(yNew - yOrig) > 1
    true

  forceMove: (xOrig, yOrig, xNew, yNew) ->
    return true if xOrig is xNew and yOrig is yNew
    @squares[xNew][yNew] = @squares[xOrig][yOrig]
    @squares[xOrig][yOrig] = UNOCCUPIED
    # TODO handle pawn advancement, castling, check/mate
    true

  promote: ({x, y}, newPieceType) ->
    canPromote = @valueAt(x, y) is @turn * PAWN and y in [0, 7] and newPieceType in [KNIGHT..QUEEN]
    if canPromote
      @squares[x][y] = @turn * newPieceType
      @advanceTurn()
      @options.onPromotion?(x, y, @squares[x][y])
    canPromote

  move: (xOrig, yOrig, xNew, yNew) ->
    moved = @canMove(xOrig, yOrig, xNew, yNew) && @forceMove(xOrig, yOrig, xNew, yNew)
    if moved
      # keep track of king/rook movement for any future castling
      homeRow = if @turn is WHITE then 0 else 7
      switch @pieceType(xNew, yNew)
        when ROOK
          @hasMoved[@turn].queensRook = true if xOrig == 0 and yOrig == homeRow
          @hasMoved[@turn].kingsRook  = true if xOrig == 7 and yOrig == homeRow
        when KING
          if !@hasMoved[@turn].king
            if xNew - xOrig == 2
              @forceMove(7, homeRow, 5, homeRow)
              @options.onForcedMove?(7, homeRow, 5, homeRow)
            else if xOrig - xNew == 2
              @forceMove(0, homeRow, 3, homeRow)
              @options.onForcedMove?(0, homeRow, 3, homeRow)
          @hasMoved[@turn].king = true
        when PAWN
          if (@turn is WHITE and yNew is 7) or (@turn is BLACK and yNew is 0)
            @options.onAdvancement?(xNew, yNew)
            return true # avoid advancing the turn

      @advanceTurn()
    return moved

  advanceTurn: ->
    # advance turn
    @turn *= -1
    # has this move resulted in check?
    [xKing, yKing] = @findPiece(@turn * KING)
    pieces = @moveResultsInCheck(xKing, yKing, xKing, yKing)
    if pieces.length > 0
      isMate = =>
        # can we move the king?
        for x in [xKing - 1..xKing + 1]
          for y in [yKing - 1..yKing + 1]
            continue if x == xKing and y == yKing
            return false if @canMove(xKing, yKing, x, y)
        if pieces.length == 1
          # can we capture?
          [xPiece, yPiece] = pieces[0]
          for x in [0..7]
            for y in [0..7]
              return false if @canMove(xPiece, yPiece, x, y)
          switch @pieceType(xPiece, yPiece)
            when BISHOP, ROOK, QUEEN
              # can we interpose?
              xDelta = xKing - xPiece
              yDelta = yKing - yPiece
              xDelta /= Math.abs(xDelta) unless xDelta is 0
              yDelta /= Math.abs(yDelta) unless yDelta is 0
              xDest = xPiece + xDelta
              yDest = yPiece + yDelta
              while xDest isnt xKing or yDest isnt yKing
                for x in [0..7]
                  for y in [0..7]
                    return false if @canMove(x, y, xDest, yDest)
                xDest += xDelta; yDest += yDelta
        return true
      if isMate() then @options.onMate?(pieces) else @options.onCheck?(pieces)

module.exports = Board
