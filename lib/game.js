const UNOCCUPIED = 0;
const WHITE = 1;
const BLACK = -1;
const PAWN = 1;
const KNIGHT = 2;
const BISHOP = 3;
const ROOK = 4;
const QUEEN = 5;
const KING = 6;

class Game {
  constructor(options = {}) {
    this.onCheck = options.onCheck;
    this.onMate = options.onMate;
    this.onPromotion = options.onPromotion;
    this.onAdvancement = options.onAdvancement;
    this.onForcedMove = options.onForcedMove;
    if (options.gameState) {
      this.loadState(options.gameState);
    } else {
      this.squares = [[], [], [], [], [], [], [], []];
      this.init();
    }
  }

  init() {
    this.squares[0][0] = this.squares[7][0] = WHITE * ROOK;
    this.squares[1][0] = this.squares[6][0] = WHITE * KNIGHT;
    this.squares[2][0] = this.squares[5][0] = WHITE * BISHOP;
    this.squares[3][0] = WHITE * QUEEN;
    this.squares[4][0] = WHITE * KING;
    for (let i = 0; i < 8; i += 1) {
      this.squares[i][1] = WHITE * PAWN;
    }
    this.squares[0][7] = this.squares[7][7] = BLACK * ROOK;
    this.squares[1][7] = this.squares[6][7] = BLACK * KNIGHT;
    this.squares[2][7] = this.squares[5][7] = BLACK * BISHOP;
    this.squares[3][7] = BLACK * QUEEN;
    this.squares[4][7] = BLACK * KING;
    for (let i = 0; i < 8; i += 1) {
      this.squares[i][6] = BLACK * PAWN;
    }
    for (let y = 2; y < 6; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        this.squares[x][y] = UNOCCUPIED;
      }
    }
    this.capturedPieces = [];
    this.hasMoved = {
     [WHITE]: {
        king: false,
        kingsRook: false,
        queensRook: false
      },
      [BLACK]: {
        king: false,
        kingsRook: false,
        queensRook: false
      }
    };
    this.turn = WHITE;
    this.inProgress = false;
  }
  loadState(state) {
    this.squares = state.squares;
    this.hasMoved = state.hasMoved;
    this.turn = state.turn;
    this.inProgress = state.inProgress;
    this.lastMove = state.lastMove;
    this.capturedPieces = state.capturedPieces;
  }
  gameState() {
    const state = {
      squares: [],
      turn: this.turn,
      inProgress: this.inProgress,
      lastMove: this.lastMove,
      capturedPieces: this.capturedPieces,
    };
    for (let x = 0; x < 8; x += 1) {
      state.squares[x] = [...this.squares[x]];
    }
    state.hasMoved = {
      [WHITE]: {
        king: this.hasMoved[WHITE].king,
        kingsRook: this.hasMoved[WHITE].kingsRook,
        queensRook: this.hasMoved[WHITE].queensRook,
      },
      [BLACK]: {
        king: this.hasMoved[BLACK].king,
        kingsRook: this.hasMoved[BLACK].kingsRook,
        queensRook: this.hasMoved[BLACK].queensRook,
      },
    };
    return state;
  }

  valueAt(x, y) { return this.squares[x][y]; }
  algebraicNotationFor(x, y) { return `${Array.from('abcdefgh')[x]}${y + 1}`; }

  findPiece(value) {
    for (let x = 0; x < 8; x += 1) {
      for (let y = 0; y < 8; y += 1) {
        if (this.valueAt(x, y) === value) {
          return [x, y];
        }
      }
    }
  }

  findPieces(value) {
    const pieces = [];
    for (let x = 0; x < 8; x += 1) {
      for (let y = 0; y < 8; y += 1) {
        if (this.valueAt(x, y) === value) {
          pieces.push({ x, y });
        }
      }
    }
    return pieces;
  }

  pawnCaptures() {
    const captures = {};
    this.findPieces(this.turn * PAWN).forEach((pawn) => {
      const spaces = [];
      if (this.canMove(pawn.x, pawn.y, pawn.x - 1, pawn.y + this.turn)) {
        spaces.push(this.algebraicNotationFor(pawn.x - 1, pawn.y + this.turn));
      }
      if (this.canMove(pawn.x, pawn.y, pawn.x + 1, pawn.y + this.turn)) {
        spaces.push(this.algebraicNotationFor(pawn.x + 1, pawn.y + this.turn));
      }
      if (spaces.length) {
        captures[this.algebraicNotationFor(pawn.x, pawn.y)] = spaces;
      }
    });
    return captures;
  }

  pieceType(x, y) {
    if (this.valueAt(x, y) !== UNOCCUPIED) {
      return Math.abs(this.valueAt(x, y));
    }
  }

  color(x, y) {
    if (this.valueAt(x, y) !== UNOCCUPIED) {
      return this.valueAt(x, y) / this.pieceType(x, y);
    }
  }

  candidateMoveIsEnPassant(xOrig, yOrig, xNew, yNew) {
    const lastMoveIsOpposingPawnTwoSpaceMove = this.lastMove &&
      this.valueAt(this.lastMove.xNew, this.lastMove.yNew) === PAWN * -this.turn &&
      this.lastMove.yNew - this.lastMove.yOrig === 2 * -this.turn;
    return lastMoveIsOpposingPawnTwoSpaceMove && this.pieceType(xOrig, yOrig) === PAWN &&
      xNew === this.lastMove.xNew && yOrig === this.lastMove.yNew;
  }

  // forces a given move, detects if a check exists, and then undoes the move
  moveResultsInCheck(xOrig, yOrig, xNew, yNew) {
    // make sure we don't recurse
    if (this.alreadyLookingForCheck) {
      return [];
    }
    this.alreadyLookingForCheck = true;
    const newSquareValue = this.valueAt(xNew, yNew);
    this.forceMove(xOrig, yOrig, xNew, yNew);
    const [xKing, yKing] = this.findPiece(this.color(xNew, yNew) * KING);
    this.turn *= -1;
    const pieces = [];
    // brute force, check all squares (could be improved)
    for (let x = 0; x < 8; x += 1) {
      for (let y = 0; y < 8; y += 1) {
        if (this.canMove(x, y, xKing, yKing)) {
          pieces.push([x, y]);
        }
      }
    }
    // reset
    this.squares[xOrig][yOrig] = this.valueAt(xNew, yNew);
    this.squares[xNew][yNew] = newSquareValue;
    this.turn *= -1;
    delete this.alreadyLookingForCheck;
    return pieces;
  }

  passesOverPieces(xOrig, yOrig, xNew, yNew) {
    let xDelta = xNew - xOrig;
    let yDelta = yNew - yOrig;
    if (xDelta) {
      xDelta /= Math.abs(xDelta);
    }
    if (yDelta) {
      yDelta /= Math.abs(yDelta);
    }
    let x = xOrig + xDelta;
    let y = yOrig + yDelta;
    while (x !== xNew || y !== yNew) {
      if (this.valueAt(x, y) !== UNOCCUPIED) {
        return true;
      }
      x += xDelta;
      y += yDelta;
    }
    return false;
  }

  canMove(xOrig, yOrig, xNew, yNew) {
    if (!this.squares[xNew] || this.squares[xNew][yNew] === undefined) {
      return false;
    }
    const color = this.color(xOrig, yOrig);
    if ((color !== this.turn) || (color === this.color(xNew, yNew)) ||
      this.moveResultsInCheck(xOrig, yOrig, xNew, yNew).length) {
      return false;
    }
    const movesLikeBishop = Math.abs(xNew - xOrig) === Math.abs(yNew - yOrig);
    const movesLikeRook = xNew === xOrig || yNew === yOrig;
    switch (this.pieceType(xOrig, yOrig)) {
      case PAWN: {
        switch (Math.abs(xNew - xOrig)) {
          case 0: { // moving
            const onHomeRow = (color === WHITE) ? yOrig === 1 : yOrig === 6;
            const maxDistance = onHomeRow ? 2 : 1;
            const distance = color * (yNew - yOrig);
            return (distance > 0 && distance <= maxDistance && this.valueAt(xNew, yNew) === UNOCCUPIED &&
              !this.passesOverPieces(xOrig, yOrig, xNew, yNew));
          }
          case 1: // capturing
            return (color === (yNew - yOrig) && this.color(xNew, yNew) === -color ||
              this.candidateMoveIsEnPassant(xOrig, yOrig, xNew, yNew));
          default:
            return false;
        }
      }
      case KNIGHT:
        return (Math.abs(xNew - xOrig) === 2 && Math.abs(yNew - yOrig) === 1) ||
          (Math.abs(xNew - xOrig) === 1 && Math.abs(yNew - yOrig) === 2);
      case BISHOP:
        return movesLikeBishop && !this.passesOverPieces(xOrig, yOrig, xNew, yNew);
      case ROOK:
        return movesLikeRook && !this.passesOverPieces(xOrig, yOrig, xNew, yNew);
      case QUEEN:
        return (movesLikeBishop || movesLikeRook) && !this.passesOverPieces(xOrig, yOrig, xNew, yNew);
      case KING: {
        const homeRow = color === WHITE ? 0 : 7;
        if (yNew === homeRow && !this.hasMoved[color].king) {
          const castleSafeFromCheck = () => {
            for (let x = Math.min(xOrig, xNew); x < Math.max(xOrig, xNew); x += 1) {
              if (this.moveResultsInCheck(xOrig, yOrig, x, yOrig).length) {
                return false;
              }
            }
            return true;
          };
          const castlingKingSide = xNew - xOrig === 2 && !this.hasMoved[color].kingsRook;
          const castlingQueenSide = xOrig - xNew === 2 && !this.hasMoved[color].queensRook;
          if (castlingKingSide || castlingQueenSide) {
            return !this.passesOverPieces(xOrig, yOrig, xNew, yNew) && castleSafeFromCheck();
          }
        }
        return (Math.abs(xNew - xOrig) <= 1 && Math.abs(yNew - yOrig) <= 1);
      }
    }
    return true;
  }

  forceMove(xOrig, yOrig, xNew, yNew) {
    if (xOrig === xNew && yOrig === yNew) {
      return true;
    }
    if (this.valueAt(xNew, yNew) !== UNOCCUPIED && this.alreadyLookingForCheck) {
      this.capturedPieces.push(this.valueAt(xNew, yNew));
    }
    this.squares[xNew][yNew] = this.squares[xOrig][yOrig];
    this.squares[xOrig][yOrig] = UNOCCUPIED;
    return true;
  }

  promote({ x, y }, newPieceType) {
    const canPromote = this.valueAt(x, y) === this.turn * PAWN &&
      (y === 0 || y === 7) && (KNIGHT <= newPieceType && newPieceType <= QUEEN);
    if (canPromote) {
      this.squares[x][y] = this.turn * newPieceType;
      this.advanceTurn();
      this.onPromotion && this.onPromotion(x, y, this.squares[x][y]);
    }
    return canPromote;
  }

  move(xOrig, yOrig, xNew, yNew) {
    const valueAtNewSquare = this.valueAt(xNew, yNew);
    const moveIsEnPassant = this.candidateMoveIsEnPassant(xOrig, yOrig, xNew, yNew);
    const moved = this.canMove(xOrig, yOrig, xNew, yNew) && this.forceMove(xOrig, yOrig, xNew, yNew);
    if (moveIsEnPassant) {
      this.capturedPiece = this.valueAt(this.lastMove.xNew, this.lastMove.yNew);
      this.squares[this.lastMove.xNew][this.lastMove.yNew] = UNOCCUPIED;
    } else {
      this.capturedPiece = valueAtNewSquare;
    }
    this.lastMove = { xOrig, yOrig, xNew, yNew };
    if (moved) {
      this.inProgress = true;
      // keep track of king/rook movement for any future castling
      const homeRow = this.turn === WHITE ? 0 : 7;
      switch (this.pieceType(xNew, yNew)) {
        case ROOK:
          if (xOrig === 0 && yOrig === homeRow) {
            this.hasMoved[this.turn].queensRook = true;
          }
          if (xOrig === 7 && yOrig === homeRow) {
            this.hasMoved[this.turn].kingsRook = true;
          }
          break;
        case KING:
          if (!this.hasMoved[this.turn].king) {
            if (xNew - xOrig === 2) {
              this.forceMove(7, homeRow, 5, homeRow);
              this.onForcedMove && this.onForcedMove(7, homeRow, 5, homeRow);
            } else if (xOrig - xNew === 2) {
              this.forceMove(0, homeRow, 3, homeRow);
              this.onForcedMove && this.onForcedMove(0, homeRow, 3, homeRow);
            }
          }
          this.hasMoved[this.turn].king = true;
          break;
        case PAWN:
          if ((this.turn === WHITE && yNew === 7) || (this.turn === BLACK && yNew === 0)) {
            this.onAdvancement && this.onAdvancement(xNew, yNew);
            return true; // avoid advancing the turn
          }
      }
      this.advanceTurn();
    }
    return moved;
  }

  advanceTurn() {
    // advance turn
    this.turn *= -1;
    // has this move resulted in check?
    const [xKing, yKing] = this.findPiece(this.turn * KING);
    const pieces = this.moveResultsInCheck(xKing, yKing, xKing, yKing);
    if (pieces.length > 0) {
      const isMate = () => {
        // can we move the king?
        for (let x = xKing - 1; x <= xKing + 1; x += 1) {
          for (let y = yKing - 1; y <= yKing + 1; y += 1) {
            if (this.canMove(xKing, yKing, x, y)) {
              return false;
            }
          }
        }
        if (pieces.length === 1) {
          // can we capture?
          const [xPiece, yPiece] = pieces[0];
          for (let x = 0; x < 8; x += 1) {
            for (let y = 0; y < 8; y += 1) {
              if (this.canMove(x, y, xPiece, yPiece)) {
                return false;
              }
            }
          }
          switch (this.pieceType(xPiece, yPiece)) {
            case BISHOP:
            case ROOK:
            case QUEEN: {
              // can we interpose?
              let xDelta = xKing - xPiece;
              let yDelta = yKing - yPiece;
              if (xDelta !== 0) {
                xDelta /= Math.abs(xDelta);
              }
              if (yDelta !== 0) {
                yDelta /= Math.abs(yDelta);
              }
              let xDest = xPiece + xDelta;
              let yDest = yPiece + yDelta;
              while (xDest !== xKing || yDest !== yKing) {
                for (let x = 0; x < 8; x += 1) {
                  for (let y = 0; y < 8; y += 1) {
                    if (this.canMove(x, y, xDest, yDest)) {
                      return false;
                    }
                  }
                }
                xDest += xDelta;
                yDest += yDelta;
              }
            }
          }
        }
        return true;
      };
      if (isMate()) {
        this.inProgress = false;
        this.onMate && this.onMate(pieces);
      } else {
        this.onCheck && this.onCheck(pieces);
      }
    }
  }
}

module.exports = exports = Game;
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = exports;
