const Game = require('../../lib/game');

describe('Game', () => {
  let onForcedMove;
  let onCheck;
  let onMate;
  let onAdvancement;
  let onPromotion;
  let game;
  beforeEach(() => {
    onForcedMove = jasmine.createSpy('onForcedMove');
    onCheck = jasmine.createSpy('onCheck');
    onMate = jasmine.createSpy('onMate');
    onAdvancement = jasmine.createSpy('onAdvancement');
    onPromotion = jasmine.createSpy('onPromotion');
    game = new Game({ onForcedMove, onCheck, onMate, onAdvancement, onPromotion });
  });
  it('can serialize the game state', () => {
    game.move(3, 1, 3, 3); // d4
    game.move(4, 6, 4, 4); // d5
    game.move(3, 3, 4, 4); // d4 x d5
    const gameState = game.gameState();
    for (let i = 0; i < 8; i += 1) {
      expect(gameState.squares[i]).toEqual(game.squares[i]);
      expect(gameState.squares[i]).not.toBe(game.squares[i]);
    }
    expect(gameState.hasMoved).toEqual(game.hasMoved);
    expect(gameState.hasMoved).not.toBe(game.hasMoved);
    expect(gameState.turn).toEqual(game.turn);
    expect(gameState.inProgress).toEqual(game.inProgress);
    expect(gameState.lastMove).toEqual(game.lastMove);
    expect(gameState.capturedPieces).toEqual(game.capturedPieces);
  });
  it('can deserialize game state', () => {
    game.move(3, 1, 3, 3); // d4
    game.move(4, 6, 4, 4); // d5
    game.move(3, 3, 4, 4); // d4 x d5
    const gameState = game.gameState();
    const newGame = new Game({ gameState });
    for (let i = 0; i < 8; i += 1) {
      expect(newGame.squares[i]).toEqual(game.squares[i]);
    }
    expect(newGame.hasMoved).toEqual(game.hasMoved);
    expect(newGame.turn).toEqual(game.turn);
    expect(newGame.inProgress).toEqual(game.inProgress);
    expect(newGame.lastMove).toEqual(game.lastMove);
    expect(newGame.capturedPieces).toEqual(game.capturedPieces);
  });
  it('is not in progress initially', () => {
    expect(game.inProgress).toBeFalsy();
  });
  it('is in progress as soon as a move has been made', () => {
    game.move(0, 1, 0, 3);
    expect(game.inProgress).toBeTruthy();
  });
  describe('#algebraicNotationFor', () => {
    it('translates x,y to a point', () => {
      expect(game.algebraicNotationFor(0, 0)).toBe('a1');
      expect(game.algebraicNotationFor(7, 7)).toBe('h8');
    });
  });
  describe('#capturedPiece', () => {
    it('returns the value of the previously captured piece', () => {
      game.forceMove(3, 0, 4, 1); // white queen e2
      game.forceMove(3, 7, 4, 2); // black queen e3
      game.move(4, 1, 4, 2); // capture black queen
      expect(game.capturedPiece).toEqual(-5);
    });
    it('resets to a falsy value if the previous move did not result in capture', () => {
      game.forceMove(3, 0, 4, 1); // white queen e2
      game.forceMove(3, 7, 4, 2); // black queen e3
      game.move(4, 1, 4, 2); // capture black queen
      game.move(4, 6, 4, 4);
      expect(game.capturedPiece).toBeFalsy();
    });
  });
  describe('#pieceType', () => {
    it('should be undefined when unoccupied', () => {
      for (let i = 0; i < 8; i += 1) {
        for (let j = 2; j < 6; j += 1) {
          expect(game.pieceType(i, j)).toBe(undefined);
        }
      }
    });
    it('should be 1 for pawns', () => {
      expect(game.pieceType(0, 1)).toBe(1);
      expect(game.pieceType(0, 6)).toBe(1);
    });
    it('should be 2 for knights', () => {
      expect(game.pieceType(1, 0)).toBe(2);
      expect(game.pieceType(1, 7)).toBe(2);
    });
    it('should be 3 for bishops', () => {
      expect(game.pieceType(2, 0)).toBe(3);
      expect(game.pieceType(2, 7)).toBe(3);
    });
    it('should be 4 for rooks', () => {
      expect(game.pieceType(0, 0)).toBe(4);
      expect(game.pieceType(0, 7)).toBe(4);
    });
    it('should be 5 for queens', () => {
      expect(game.pieceType(3, 0)).toBe(5);
      expect(game.pieceType(3, 7)).toBe(5);
    });
    it('should be 6 for kings', () => {
      expect(game.pieceType(4, 0)).toBe(6);
      expect(game.pieceType(4, 7)).toBe(6);
    });
  });
  describe('#color', () => {
    it('should be positive for white pieces', () => {
      for (let i = 0; i < 8; i += 1) {
        expect(game.color(i, 0)).toBeGreaterThan(0);
        expect(game.color(i, 1)).toBeGreaterThan(0);
      }
    });
    it('should be negative for black pieces', () => {
      for (let i = 0; i < 8; i += 1) {
        expect(game.color(i, 6)).toBeLessThan(0);
        expect(game.color(i, 7)).toBeLessThan(0);
      }
    });
    it('should be undefined for unoccupied spaces', () => {
      for (let i = 0; i < 8; i += 1) {
        for (let j = 2; j < 6; j += 1) {
          expect(game.color(i, j)).toBe(undefined);
        }
      }
    });
  });
  describe('capturing', () => {
    it('keeps track of captured pieces', () => {
      game.forceMove(4, 6, 4, 3); // black to e4
      expect(game.move(3, 1, 3, 3)).toBeTruthy(); // d4
      game.move(4, 3, 3, 3); // e4 x d4
      expect(game.capturedPieces).toEqual([1]);
    });
  });

  describe('a piece', () => {
    it("can't move off the board", () => {
      expect(game.canMove(0, 0, 0, -1)).toBeFalsy();
    });
    it("can't capture a piece of the same color", () => {
      expect(game.canMove(4, 0, 4, 1)).toBeFalsy();
      game.forceMove(4, 1, 4, 3);
      expect(game.canMove(4, 0, 4, 1)).toBeTruthy();
    });
    it("can't be moved if it's not that piece's turn", () => {
      expect(game.canMove(0, 6, 0, 5)).toBeFalsy();
      expect(game.move(0, 1, 0, 3)).toBeTruthy();
      expect(game.canMove(0, 6, 0, 5)).toBeTruthy();
    });
    it("can't be moved if it results in check", () => {
      game.forceMove(3, 0, 4, 1); // white queen e2
      game.forceMove(3, 7, 4, 2); // black queen e3
      expect(game.canMove(4, 1, 3, 2)).toBeFalsy(); // can't move white queen out of the way
    });
  });
  describe('a pawn', () => {
    it('should be able to advance twice from homerow', () => {
      expect(game.canMove(0, 1, 0, 3)).toBeTruthy();
      game.move(0, 1, 0, 3); // advance turn
      expect(game.canMove(0, 6, 0, 4)).toBeTruthy();
    });
    it("shouldn't be able to advance twice if not on the homerow", () => {
      game.forceMove(0, 1, 3, 3);
      expect(game.canMove(3, 3, 3, 5)).toBeFalsy();
    });
    it('should be able to advance once from anywhere', () => {
      expect(game.move(0, 1, 0, 2)).toBeTruthy();
      expect(game.move(0, 6, 0, 5)).toBeTruthy();
      game.forceMove(0, 2, 3, 3);
      expect(game.canMove(3, 3, 3, 4)).toBeTruthy();
    });
    it("shouldn't be able to advance onto another piece", () => {
      game.forceMove(0, 1, 0, 5);
      expect(game.canMove(0, 5, 0, 6)).toBeFalsy();
    });
    it('should be able to capture a piece diagonally in front of it', () => {
      game.forceMove(4, 1, 4, 3);
      expect(game.canMove(4, 3, 3, 4)).toBeFalsy();
      game.forceMove(3, 6, 3, 4);
      expect(game.canMove(4, 3, 3, 4)).toBeTruthy();
    });
    it('should be able to capture en passant if the previous move enables it', () => {
      game.forceMove(4, 6, 4, 3); // black to e4
      expect(game.move(3, 1, 3, 3)).toBeTruthy(); // d4
      expect(game.move(4, 3, 3, 2)).toBeTruthy(); // exd3
      expect(game.capturedPiece).toEqual(1);
      expect(game.valueAt(3, 3)).toBe(0);
    });
    it('should not be able to capture en passant if play has continued past an opportunity', () => {
      game.forceMove(4, 6, 4, 3); // black to e4
      game.move(3, 1, 3, 3); // d4
      game.move(1, 7, 0, 5); // Na6
      game.move(1, 0, 0, 2); // Na3
      expect(game.move(4, 3, 3, 2)).toBeFalsy(); // exd3 not allowed
      expect(game.capturedPiece).toBeFalsy();
      expect(game.valueAt(3, 3)).toBe(1);
    });
    describe('#pawnCaptures', () => {
      it('returns which pawns can capture which squares', () => {
        game.forceMove(4, 1, 4, 3);
        game.forceMove(3, 6, 3, 4);
        expect(game.pawnCaptures().e4).toEqual(['d5']);
        game.forceMove(5, 6, 5, 4);
        expect(game.pawnCaptures().e4).toEqual(['d5', 'f5']);
      });
    });
    describe('advancing a pawn to the final row', () => {
      beforeEach(() => {
        game.forceMove(0, 1, 0, 6);
        game.forceMove(0, 7, 1, 7); // move rook out of the way
      });
      it('fires an event that the pawn is eligible for promotion', () => {
        game.move(0, 6, 0, 7);
        expect(onAdvancement).toHaveBeenCalled();
      });
      it("doesn't advance the turn", () => {
        const origTurn = game.turn;
        game.move(0, 6, 0, 7);
        expect(game.turn).toEqual(origTurn);
      });
    });
    describe('promoting a pawn to the final row', () => {
      beforeEach(() => {
        game.forceMove(0, 1, 0, 7); // move white pawn to last row
      });
      it('changes the piece', () => {
        game.promote({ x: 0, y: 7 }, 5);
        expect(game.pieceType(0, 7)).toBe(5);
      });
      it('advances the turn', () => {
        const origTurn = game.turn;
        game.promote({ x: 0, y: 7 }, 5);
        expect(game.turn).toEqual(-1 * origTurn);
      });
      it('calls a callback', () => {
        game.promote({ x: 0, y: 7 }, 5);
        expect(onPromotion).toHaveBeenCalled();
      });
    });
  });
  describe('a knight', () => {
    it('moves in an L shape', () => {
      game.forceMove(1, 0, 4, 4);
      expect(game.canMove(4, 4, 5, 2)).toBeTruthy();
      expect(game.canMove(4, 4, 5, 6)).toBeTruthy();
      expect(game.canMove(4, 4, 6, 3)).toBeTruthy();
      expect(game.canMove(4, 4, 6, 5)).toBeTruthy();
      expect(game.canMove(4, 4, 3, 2)).toBeTruthy();
      expect(game.canMove(4, 4, 3, 6)).toBeTruthy();
      expect(game.canMove(4, 4, 2, 3)).toBeTruthy();
      expect(game.canMove(4, 4, 2, 5)).toBeTruthy();
    });
  });
  describe('a bishop', () => {
    it('moves on the diagonals', () => {
      canMoveLikeBishop(2, 0);
    });
    it("can't jump over pieces", () => {
      game.forceMove(2, 0, 5, 5);
      expect(game.canMove(5, 5, 2, 2)).toBeTruthy();
      game.forceMove(4, 6, 4, 4);
      expect(game.canMove(5, 5, 2, 2)).toBeFalsy();
    });
  });
  describe('a rook', () => {
    it('moves on the rows/columns', () => {
      canMoveLikeRook(0, 0);
    });
    it("can't jump over pieces", () => {
      game.forceMove(0, 0, 4, 4);
      expect(game.canMove(4, 4, 0, 4)).toBeTruthy();
      game.forceMove(3, 6, 3, 4);
      expect(game.valueAt(3, 4)).toBe(-1);
      expect(game.canMove(4, 4, 0, 4)).toBeFalsy();
    });
  });
  describe('a queen', () => {
    it('can move like a rook on rows/columns', () => {
      canMoveLikeRook(3, 0);
    });
    it('can move like a bishop on the diagonals', () => {
      canMoveLikeBishop(3, 0);
    });
    it("can't jump over pieces", () => {
      game.forceMove(3, 0, 4, 4);
      expect(game.canMove(4, 4, 0, 4)).toBeTruthy();
      game.forceMove(3, 6, 3, 4);
      expect(game.canMove(4, 4, 0, 4)).toBeFalsy();
    });
  });
  describe('a king', () => {
    it('can move one square in any direction', () => {
      game.forceMove(4, 0, 3, 3);
      expect(game.canMove(3, 3, 2, 2)).toBeTruthy();
      expect(game.canMove(3, 3, 3, 2)).toBeTruthy();
      expect(game.canMove(3, 3, 4, 2)).toBeTruthy();
      expect(game.canMove(3, 3, 2, 3)).toBeTruthy();
      expect(game.canMove(3, 3, 4, 3)).toBeTruthy();
      expect(game.canMove(3, 3, 2, 4)).toBeTruthy();
      expect(game.canMove(3, 3, 3, 4)).toBeTruthy();
      expect(game.canMove(3, 3, 4, 4)).toBeTruthy();
    });
    it('fires event when placed in check', () => {
      game.forceMove(3, 0, 5, 3);
      expect(game.move(5, 3, 5, 6)).toBeTruthy();
      expect(onCheck).toHaveBeenCalled();
    });
    describe('checkmate', () => {
      beforeEach(() => {
        game.move(5, 1, 5, 2); // f3
        game.move(4, 6, 4, 4); // e5
        game.move(6, 1, 6, 3); // g4
      });
      it('occurs if the king is unable to move', () => {
        expect(game.move(3, 7, 7, 3)).toBeTruthy(); // Qh4
        expect(game.inProgress).toBeFalsy();
        expect(onMate).toHaveBeenCalled();
      });
      it('does not occur if the king can move', () => {
        game.forceMove(3, 1, 3, 2); // d3
        expect(game.move(3, 7, 7, 3)).toBeTruthy(); // Qh4
        expect(game.canMove(4, 0, 3, 1)).toBeTruthy(); // Kd2
        expect(game.inProgress).toBeTruthy();
        expect(onMate).not.toHaveBeenCalled();
      });
      it('does not occur if checking piece can be captured', () => {
        game.forceMove(6, 0, 6, 1); // Ng2
        expect(game.move(3, 7, 7, 3)).toBeTruthy(); // Qh4
        expect(game.canMove(6, 1, 7, 3)).toBeTruthy(); // Nxh4
        expect(game.inProgress).toBeTruthy();
        expect(onMate).not.toHaveBeenCalled();
      });
      it('does not occur if check can be interposed', () => {
        game.forceMove(6, 3, 6, 1); // force pawn back to g2
        expect(game.move(3, 7, 7, 3)).toBeTruthy(); // Qh4
        expect(game.canMove(6, 1, 6, 2)).toBeTruthy(); // g3
        expect(game.inProgress).toBeTruthy();
        expect(onMate).not.toHaveBeenCalled();
      });
    });
    describe('when castling', () => {
      beforeEach(() => {
        [0, 7].forEach((row) => { // white, black
          [1, 2, 3, 5, 6].forEach((col) => { // knight, bishop, queen, bishop, knight
            game.squares[col][row] = 0 // unoccupied
          });
        });
      });
      it('can castle king-side', () => {
        [0, 7].forEach((row) => {
          game.turn = (row === 0) ? 1 : -1;
          expect(game.move(4, row, 6, row)).toBeTruthy();
          expect(game.pieceType(7, row)).toBeUndefined();
          expect(game.pieceType(5, row)).toBe(4);
          expect(onForcedMove).toHaveBeenCalledWith(7, row, 5, row);
        });
      });
      it("can't castle king-side if the king's rook has moved", () => {
        [0, 7].forEach((row) => {
          game.turn = (row === 0) ? 1 : -1;
          expect(game.canMove(4, row, 6, row)).toBeTruthy();
          game.move(7, row, 5, row);
          game.turn *= -1; // advance turn
          game.move(5, row, 7, row);
          game.turn *= -1; // advance turn
          expect(game.canMove(4, row, 6, row)).toBeFalsy();
        });
      });
      it('can castle queen-side', () => {
        [0, 7].forEach((row) => {
          game.turn = (row === 0) ? 1 : -1;
          expect(game.move(4, row, 2, row)).toBeTruthy();
          expect(game.pieceType(0, row)).toBeUndefined();
          expect(game.pieceType(3, row)).toBe(4);
          expect(onForcedMove).toHaveBeenCalledWith(0, row, 3, row);
        });
      });
      it("can't castle queen-side if the queen's rook has moved", () => {
        [0, 7].forEach((row) => {
          game.turn = (row === 0) ? 1 : -1;
          expect(game.canMove(4, row, 2, row)).toBeTruthy();
          game.move(0, row, 1, row);
          game.turn *= -1; // advance turn
          expect(game.move(4, row, 2, row)).toBeFalsy();
        });
      });
      it("can't castle out of check", () => {
        [0, 7].forEach((row) => {
          game.turn = (row === 0) ? 1 : -1;
          game.forceMove(4, row + game.turn, 0, 5); // displace pawn
          game.squares[4][3] = -5 * game.turn; // place other queen on same column as white king
          expect(game.canMove(4, row, 6, row)).toBeFalsy();
        });
      });
      it("can't castle through check", () => {
        [0, 7].forEach((row) => {
          game.turn = (row === 0) ? 1 : -1;
          game.forceMove(5, row + game.turn, 0, 5); // displace pawn
          game.squares[5][3] = -5 * game.turn; // place other queen on column king will pass through
          expect(game.canMove(4, row, 6, row)).toBeFalsy();
        });
      });
      it("can't castle into check", () => {
        [0, 7].forEach((row) => {
          game.turn = (row === 0) ? 1 : -1;
          game.forceMove(6, row + game.turn, 0, 5); // displace pawn
          game.squares[6][3] = -5 * game.turn; // place other queen on column king will pass into
          expect(game.canMove(4, row, 6, row)).toBeFalsy();
        });
      });
    });
  });
  function canMoveLikeBishop(xOrig, yOrig) {
    game.forceMove(xOrig, yOrig, 4, 4);
    expect(game.canMove(4, 4, 2, 2)).toBeTruthy();
    expect(game.canMove(4, 4, 2, 6)).toBeTruthy();
    expect(game.canMove(4, 4, 3, 3)).toBeTruthy();
    expect(game.canMove(4, 4, 3, 5)).toBeTruthy();
    expect(game.canMove(4, 4, 5, 5)).toBeTruthy();
    expect(game.canMove(4, 4, 5, 3)).toBeTruthy();
    expect(game.canMove(4, 4, 6, 6)).toBeTruthy();
    expect(game.canMove(4, 4, 6, 2)).toBeTruthy();
  };
  function canMoveLikeRook(xOrig, yOrig) {
    game.forceMove(xOrig, yOrig, 4, 4);
    expect(game.canMove(4, 4, 0, 4)).toBeTruthy();
    expect(game.canMove(4, 4, 1, 4)).toBeTruthy();
    expect(game.canMove(4, 4, 2, 4)).toBeTruthy();
    expect(game.canMove(4, 4, 3, 4)).toBeTruthy();
    expect(game.canMove(4, 4, 5, 4)).toBeTruthy();
    expect(game.canMove(4, 4, 6, 4)).toBeTruthy();
    expect(game.canMove(4, 4, 7, 4)).toBeTruthy();
    expect(game.canMove(4, 4, 4, 2)).toBeTruthy();
    expect(game.canMove(4, 4, 4, 3)).toBeTruthy();
    expect(game.canMove(4, 4, 4, 5)).toBeTruthy();
    expect(game.canMove(4, 4, 4, 6)).toBeTruthy();
  };
});
