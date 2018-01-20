describe "Board", ->
  Board = require("#{__dirname}/../../lib/board")
  board         = undefined
  onForcedMove  = undefined
  onCheck       = undefined
  onMate        = undefined
  onAdvancement = undefined
  onPromotion   = undefined
  beforeEach ->
    onForcedMove  = jasmine.createSpy('onForcedMove')
    onCheck       = jasmine.createSpy('onCheck')
    onMate        = jasmine.createSpy('onMate')
    onAdvancement = jasmine.createSpy('onAdvancement')
    onPromotion   = jasmine.createSpy('onPromotion')
    board = new Board {onForcedMove, onCheck, onMate, onAdvancement, onPromotion}

  it "can serialize the game state", ->
    board.move 3, 1, 3, 3 # d4
    board.move 3, 6, 3, 4 # d5
    gameState = board.gameState()
    for i in [0...8]
      expect(gameState.squares[i]).toEqual board.squares[i]
      expect(gameState.squares[i]).not.toBe board.squares[i]
    expect(gameState.hasMoved).toEqual board.hasMoved
    expect(gameState.hasMoved).not.toBe board.hasMoved
    expect(gameState.turn).toEqual board.turn
    expect(gameState.inProgress).toEqual board.inProgress
    expect(gameState.lastMove).toEqual board.lastMove

  it "can deserialize game state", ->
    board.move 3, 1, 3, 3 # d4
    board.move 3, 6, 3, 4 # d5
    gameState = board.gameState()
    newBoard = new Board {gameState}
    for i in [0...8]
      expect(newBoard.squares[i]).toEqual board.squares[i]
    expect(newBoard.hasMoved).toEqual board.hasMoved
    expect(newBoard.turn).toEqual board.turn
    expect(newBoard.inProgress).toEqual board.inProgress
    expect(newBoard.lastMove).toEqual board.lastMove

  it "is not in progress initially", ->
    expect(board.inProgress).toBeFalsy()

  it "is in progress as soon as a move has been made", ->
    board.move 0, 1, 0, 3
    expect(board.inProgress).toBeTruthy()

  describe "#algebraicNotationFor", ->
    it "translates x,y to a point", ->
      expect(board.algebraicNotationFor(0, 0)).toBe 'a1'
      expect(board.algebraicNotationFor(7, 7)).toBe 'h8'

  describe "#capturedPiece", ->
    it "returns the value of the previously captured piece", ->
      board.forceMove 3, 0, 4, 1 # white queen e2
      board.forceMove 3, 7, 4, 2 # black queen e3
      board.move 4, 1, 4, 2 # capture black queen
      expect(board.capturedPiece).toEqual -5
    it "resets to a falsy value if the previous move did not result in capture", ->
      board.forceMove 3, 0, 4, 1 # white queen e2
      board.forceMove 3, 7, 4, 2 # black queen e3
      board.move 4, 1, 4, 2 # capture black queen
      board.move 4, 6, 4, 4
      expect(board.capturedPiece).toBeFalsy()

  describe "#pieceType", ->
    it "should be undefined when unoccupied", ->
      for i in [0...8]
        for j in [2...6]
          expect(board.pieceType(i, j)).toBe undefined

    it "should be 1 for pawns", ->
      expect(board.pieceType(0, 1)).toBe 1
      expect(board.pieceType(0, 6)).toBe 1

    it "should be 2 for knights", ->
      expect(board.pieceType(1, 0)).toBe 2
      expect(board.pieceType(1, 7)).toBe 2

    it "should be 3 for bishops", ->
      expect(board.pieceType(2, 0)).toBe 3
      expect(board.pieceType(2, 7)).toBe 3

    it "should be 4 for rooks", ->
      expect(board.pieceType(0, 0)).toBe 4
      expect(board.pieceType(0, 7)).toBe 4

    it "should be 5 for queens", ->
      expect(board.pieceType(3, 0)).toBe 5
      expect(board.pieceType(3, 7)).toBe 5

    it "should be 6 for kings", ->
      expect(board.pieceType(4, 0)).toBe 6
      expect(board.pieceType(4, 7)).toBe 6


  describe "#color", ->
    it "should be positive for white pieces", ->
      for i in [0...8]
        expect(board.color(i, 0)).toBeGreaterThan 0
        expect(board.color(i, 1)).toBeGreaterThan 0

    it "should be negative for black pieces", ->
      for i in [0...8]
        expect(board.color(i, 6)).toBeLessThan 0
        expect(board.color(i, 7)).toBeLessThan 0

    it "should be undefined for unoccupied spaces", ->
      for i in [0...8]
        for j in [2...6]
          expect(board.color(i, j)).toBe undefined


  describe "a piece", ->
    it "can't move off the board", ->
      expect(board.canMove(0, 0, 0, -1)).toBeFalsy()

    it "can't capture a piece of the same color", ->
      expect(board.canMove(4, 0, 4, 1)).toBeFalsy()
      board.forceMove 4, 1, 4, 3
      expect(board.canMove(4, 0, 4, 1)).toBeTruthy()

    it "can't be moved if it's not that piece's turn", ->
      expect(board.canMove(0, 6, 0, 5)).toBeFalsy()
      expect(board.move(0, 1, 0, 3)).toBeTruthy()
      expect(board.canMove(0, 6, 0, 5)).toBeTruthy()

    it "can't be moved if it results in check", ->
      board.forceMove 3, 0, 4, 1 # white queen e2
      board.forceMove 3, 7, 4, 2 # black queen e3
      expect(board.canMove 4, 1, 3, 2).toBeFalsy() # can't move white queen out of the way


  describe "a pawn", ->
    it "should be able to advance twice from homerow", ->
      expect(board.canMove(0, 1, 0, 3)).toBeTruthy()
      board.move 0, 1, 0, 3 # advance turn
      expect(board.canMove(0, 6, 0, 4)).toBeTruthy()

    it "shouldn't be able to advance twice if not on the homerow", ->
      board.forceMove 0, 1, 3, 3
      expect(board.canMove(3, 3, 3, 5)).toBeFalsy()

    it "should be able to advance once from anywhere", ->
      expect(board.move(0, 1, 0, 2)).toBeTruthy()
      expect(board.move(0, 6, 0, 5)).toBeTruthy()
      board.forceMove 0, 2, 3, 3
      expect(board.canMove(3, 3, 3, 4)).toBeTruthy()

    it "shouldn't be able to advance onto another piece", ->
      board.forceMove 0, 1, 0, 5
      expect(board.canMove(0, 5, 0, 6)).toBeFalsy()

    it "should be able to capture a piece diagonally in front of it", ->
      board.forceMove 4, 1, 4, 3
      expect(board.canMove(4, 3, 3, 4)).toBeFalsy()
      board.forceMove 3, 6, 3, 4
      expect(board.canMove(4, 3, 3, 4)).toBeTruthy()

    it "should be able to capture en passant if the previous move enables it", ->
      board.forceMove 4, 6, 4, 3 # black to e4
      expect(board.move(3, 1, 3, 3)).toBeTruthy() # d4
      expect(board.move(4, 3, 3, 2)).toBeTruthy() # exd3
      expect(board.capturedPiece).toEqual 1
      expect(board.valueAt(3, 3)).toBe 0

    it "should not be able to capture en passant if play has continued past an opportunity", ->
      board.forceMove 4, 6, 4, 3 # black to e4
      board.move 3, 1, 3, 3 # d4
      board.move 1, 7, 0, 5 # Na6
      board.move 1, 0, 0, 2 # Na3
      expect(board.move(4, 3, 3, 2)).toBeFalsy() # exd3 not allowed
      expect(board.capturedPiece).toBeFalsy()
      expect(board.valueAt(3, 3)).toBe 1

    describe "#pawnCaptures", ->
      it "returns which pawns can capture which squares", ->
        board.forceMove 4, 1, 4, 3
        board.forceMove 3, 6, 3, 4
        expect(board.pawnCaptures().e4).toEqual ['d5']
        board.forceMove 5, 6, 5, 4
        expect(board.pawnCaptures().e4).toEqual ['d5', 'f5']

    describe "advancing a pawn to the final row", ->
      beforeEach ->
        board.forceMove 0, 1, 0, 6
        board.forceMove 0, 7, 1, 7 # move rook out of the way

      it "fires an event that the pawn is eligible for promotion", ->
        board.move 0, 6, 0, 7
        expect(onAdvancement).toHaveBeenCalled()

      it "doesn't advance the turn", ->
        origTurn = board.turn
        board.move 0, 6, 0, 7
        expect(board.turn).toEqual(origTurn)

    describe "promoting a pawn to the final row", ->
      beforeEach ->
        board.forceMove 0, 1, 0, 7 # move white pawn to last row

      it "changes the piece", ->
        board.promote {x: 0, y: 7}, 5
        expect(board.pieceType(0, 7)).toBe 5

      it "advances the turn", ->
        origTurn = board.turn
        board.promote {x: 0, y: 7}, 5
        expect(board.turn).toEqual(-1 * origTurn)

      it "calls a callback", ->
        board.promote {x: 0, y: 7}, 5
        expect(onPromotion).toHaveBeenCalled()


  describe "a knight", ->
    it "moves in an L shape", ->
      board.forceMove 1, 0, 4, 4
      expect(board.canMove(4, 4, 5, 2)).toBeTruthy()
      expect(board.canMove(4, 4, 5, 6)).toBeTruthy()
      expect(board.canMove(4, 4, 6, 3)).toBeTruthy()
      expect(board.canMove(4, 4, 6, 5)).toBeTruthy()
      expect(board.canMove(4, 4, 3, 2)).toBeTruthy()
      expect(board.canMove(4, 4, 3, 6)).toBeTruthy()
      expect(board.canMove(4, 4, 2, 3)).toBeTruthy()
      expect(board.canMove(4, 4, 2, 5)).toBeTruthy()


  describe "a bishop", ->
    it "moves on the diagonals", ->
      canMoveLikeBishop 2, 0

    it "can't jump over pieces", ->
      board.forceMove 2, 0, 5, 5
      expect(board.canMove(5, 5, 2, 2)).toBeTruthy()
      board.forceMove 4, 6, 4, 4
      expect(board.canMove(5, 5, 2, 2)).toBeFalsy()


  describe "a rook", ->
    it "moves on the rows/columns", ->
      canMoveLikeRook 0, 0

    it "can't jump over pieces", ->
      board.forceMove 0, 0, 4, 4
      expect(board.canMove(4, 4, 0, 4)).toBeTruthy()
      board.forceMove 3, 6, 3, 4
      expect(board.valueAt(3,4)).toBe -1
      expect(board.canMove(4, 4, 0, 4)).toBeFalsy()


  describe "a queen", ->
    it "can move like a rook on rows/columns", ->
      canMoveLikeRook 3, 0

    it "can move like a bishop on the diagonals", ->
      canMoveLikeBishop 3, 0

    it "can't jump over pieces", ->
      board.forceMove 3, 0, 4, 4
      expect(board.canMove(4, 4, 0, 4)).toBeTruthy()
      board.forceMove 3, 6, 3, 4
      expect(board.canMove(4, 4, 0, 4)).toBeFalsy()

  describe "a king", ->
    it "can move one square in any direction", ->
      board.forceMove 4, 0, 3, 3
      expect(board.canMove(3, 3, 2, 2)).toBeTruthy()
      expect(board.canMove(3, 3, 3, 2)).toBeTruthy()
      expect(board.canMove(3, 3, 4, 2)).toBeTruthy()
      expect(board.canMove(3, 3, 2, 3)).toBeTruthy()
      expect(board.canMove(3, 3, 4, 3)).toBeTruthy()
      expect(board.canMove(3, 3, 2, 4)).toBeTruthy()
      expect(board.canMove(3, 3, 3, 4)).toBeTruthy()
      expect(board.canMove(3, 3, 4, 4)).toBeTruthy()

    it "fires event when placed in check", ->
      board.forceMove 3, 0, 5, 3
      expect(board.move 5, 3, 5, 6).toBeTruthy()
      expect(onCheck).toHaveBeenCalled()

    describe "checkmate", ->
      beforeEach ->
        board.move 5, 1, 5, 2 # f3
        board.move 4, 6, 4, 4 # e5
        board.move 6, 1, 6, 3 # g4
      it "occurs if the king is unable to move", ->
        expect(board.move 3, 7, 7, 3).toBeTruthy() # Qh4
        expect(board.inProgress).toBeFalsy()
        expect(onMate).toHaveBeenCalled()
      it "does not occur if the king can move", ->
        board.forceMove 3, 1, 3, 2 # d3
        expect(board.move 3, 7, 7, 3).toBeTruthy() # Qh4
        expect(board.canMove(4, 0, 3, 1)).toBeTruthy() # Kd2
        expect(board.inProgress).toBeTruthy()
        expect(onMate).not.toHaveBeenCalled()
      it "does not occur if checking piece can be captured", ->
        board.forceMove 6, 0, 6, 1 # Ng2
        expect(board.move 3, 7, 7, 3).toBeTruthy() # Qh4
        expect(board.canMove(6, 1, 7, 3)).toBeTruthy() # Nxh4
        expect(board.inProgress).toBeTruthy()
        expect(onMate).not.toHaveBeenCalled()
      it "does not occur if check can be interposed", ->
        board.forceMove 6, 3, 6, 1 # force pawn back to g2
        expect(board.move 3, 7, 7, 3).toBeTruthy() # Qh4
        expect(board.canMove(6, 1, 6, 2)).toBeTruthy() # g3
        expect(board.inProgress).toBeTruthy()
        expect(onMate).not.toHaveBeenCalled()


    describe "when castling", ->
      beforeEach ->
        for row in [0, 7] # white, black
          for col in [1, 2, 3, 5, 6] # knight, bishop, queen, bishop, knight
            board.squares[col][row] = 0 # unoccupied

      it "can castle king-side", ->
        for row in [0, 7]
          board.turn = if row is 0 then 1 else -1
          expect(board.move(4, row, 6, row)).toBeTruthy()
          expect(board.pieceType(7, row)).toBeUndefined()
          expect(board.pieceType(5, row)).toBe 4
          expect(onForcedMove).toHaveBeenCalledWith(7, row, 5, row)

      it "can't castle king-side if the king's rook has moved", ->
        for row in [0, 7]
          board.turn = if row is 0 then 1 else -1
          expect(board.canMove(4, row, 6, row)).toBeTruthy()
          board.move 7, row, 5, row
          board.turn *= -1 # advance turn
          board.move 5, row, 7, row
          board.turn *= -1 # advance turn
          expect(board.canMove(4, row, 6, row)).toBeFalsy()

      it "can castle queen-side", ->
        for row in [0, 7]
          board.turn = if row is 0 then 1 else -1
          expect(board.move(4, row, 2, row)).toBeTruthy()
          expect(board.pieceType(0, row)).toBeUndefined()
          expect(board.pieceType(3, row)).toBe 4
          expect(onForcedMove).toHaveBeenCalledWith(0, row, 3, row)

      it "can't castle queen-side if the queen's rook has moved", ->
        for row in [0, 7]
          board.turn = if row is 0 then 1 else -1
          expect(board.canMove(4, row, 2, row)).toBeTruthy()
          board.move 0, row, 1, row
          board.turn *= -1 # advance turn
          expect(board.move(4, row, 2, row)).toBeFalsy()

      it "can't castle out of check", ->
        for row in [0, 7]
          board.turn = if row is 0 then 1 else -1
          board.forceMove 4, row + board.turn, 0, 5 # displace pawn
          board.squares[4][3] = -5 * board.turn # place other queen on same column as white king
          expect(board.canMove(4, row, 6, row)).toBeFalsy()

      it "can't castle through check", ->
        for row in [0, 7]
          board.turn = if row is 0 then 1 else -1
          board.forceMove 5, row + board.turn, 0, 5 # displace pawn
          board.squares[5][3] = -5 * board.turn # place other queen on column king will pass through
          expect(board.canMove(4, row, 6, row)).toBeFalsy()

      it "can't castle into check", ->
        for row in [0, 7]
          board.turn = if row is 0 then 1 else -1
          board.forceMove 6, row + board.turn, 0, 5 # displace pawn
          board.squares[6][3] = -5 * board.turn # place other queen on column king will pass into
          expect(board.canMove(4, row, 6, row)).toBeFalsy()



  canMoveLikeBishop = (xOrig, yOrig) ->
    board.forceMove xOrig, yOrig, 4, 4
    expect(board.canMove(4, 4, 2, 2)).toBeTruthy()
    expect(board.canMove(4, 4, 2, 6)).toBeTruthy()
    expect(board.canMove(4, 4, 3, 3)).toBeTruthy()
    expect(board.canMove(4, 4, 3, 5)).toBeTruthy()
    expect(board.canMove(4, 4, 5, 5)).toBeTruthy()
    expect(board.canMove(4, 4, 5, 3)).toBeTruthy()
    expect(board.canMove(4, 4, 6, 6)).toBeTruthy()
    expect(board.canMove(4, 4, 6, 2)).toBeTruthy()

  canMoveLikeRook = (xOrig, yOrig) ->
    board.forceMove xOrig, yOrig, 4, 4
    expect(board.canMove(4, 4, 0, 4)).toBeTruthy()
    expect(board.canMove(4, 4, 1, 4)).toBeTruthy()
    expect(board.canMove(4, 4, 2, 4)).toBeTruthy()
    expect(board.canMove(4, 4, 3, 4)).toBeTruthy()
    expect(board.canMove(4, 4, 5, 4)).toBeTruthy()
    expect(board.canMove(4, 4, 6, 4)).toBeTruthy()
    expect(board.canMove(4, 4, 7, 4)).toBeTruthy()
    expect(board.canMove(4, 4, 4, 2)).toBeTruthy()
    expect(board.canMove(4, 4, 4, 3)).toBeTruthy()
    expect(board.canMove(4, 4, 4, 5)).toBeTruthy()
    expect(board.canMove(4, 4, 4, 6)).toBeTruthy()
