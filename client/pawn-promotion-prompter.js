import React from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import { character } from './piece';
import { onPromotionSelection } from './actions';

function pieceSelectionRenderer(onSelection, color) {
  return (type) => {
    return (
      <button key={type} onClick={() => onSelection(type)}>{character({ type, color })}</button>
    );
  };
}

export function PawnPromotionPrompter({ shouldShow, turn, onSelection }) {
  const onSelectionForType = pieceSelectionRenderer(onSelection, turn);
  return (
    <Modal isOpen={shouldShow}>
      <div className="choices">
        {[2, 3, 4, 5].map(onSelectionForType)}
      </div>
    </Modal>
  );
}

function mapStateToProps({ user, game: { players, pawnAdvance, board: { turn } } }) {
  const currentPlayer = players[(turn === 1) ? 'white' : 'black'];
  return {
    shouldShow: !!pawnAdvance && currentPlayer && currentPlayer.id === user.id,
    promotionSquare: pawnAdvance,
    turn,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onSelection(newPieceValue) {
      return (promotionSquare) => dispatch(onPromotionSelection(promotionSquare, newPieceValue));
    }
  }
}

function mergeProps({ shouldShow, promotionSquare, turn }, { onSelection }, ownProps) {
  return Object.assign({}, ownProps, {
    shouldShow,
    turn,
    onSelection: (newPieceValue) => onSelection(newPieceValue)(promotionSquare),
  });
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PawnPromotionPrompter);
