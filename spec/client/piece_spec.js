import '../client_helper';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import TestBackend from 'react-dnd-test-backend';
import { DragDropContext } from 'react-dnd';
import Piece from '../../client/piece';

function wrapInTestContext(DecoratedComponent) {
  return DragDropContext(TestBackend)(
    class TestContextContainer extends React.Component {
      render() {
        return <DecoratedComponent {...this.props} />;
      }
    }
  );
}

describe('Piece', () => {
  const OrigPiece = Piece.DecoratedComponent;
  const identity = el => el;

  function createPiece(props = {}) {
    return ReactTestUtils.renderIntoDocument(<OrigPiece
            type={props.type || 1}
            color={props.color || 1}
            connectDragSource={props.connectDragSource || identity}
            isDragging={props.isDragging || false} />);
  }

  it('renders the appropriate piece type', () => {
    var piece = createPiece();
    expect(piece.render().props.children).toEqual('♙');
  });

  it('renders the appropriate color', () => {
    var piece = createPiece({color: -1});
    expect(piece.render().props.children).toEqual('♟');
  });

  it('is opaque if not currently being dragged', () => {
    var piece = createPiece({isDragging: false});
    expect(piece.render().props.style.opacity).toEqual(1);
  });

  it('is 50% transparent if currently being dragged', () => {
    var piece = createPiece({isDragging: true});
    expect(piece.render().props.style.opacity).toEqual(0.5);
  });

  it('can be dragged if a drag source allows it', () => {
    const PieceContext = wrapInTestContext(Piece);
    const root = ReactTestUtils.renderIntoDocument(<PieceContext
      type={1} color={1}
      canDrag={true} />);
    const backend = root.getManager().getBackend();

    const piece = ReactTestUtils.findRenderedComponentWithType(root, Piece);
    backend.simulateBeginDrag([piece.getHandlerId()]);
    expect(piece.render().props.isDragging).toBeTruthy();
  });

  it('can not be dragged if a drag source prohibits it', () => {
    const PieceContext = wrapInTestContext(Piece);
    const root = ReactTestUtils.renderIntoDocument(<PieceContext
      type={1} color={1}
      canDrag={false} />);
    const backend = root.getManager().getBackend();

    const piece = ReactTestUtils.findRenderedComponentWithType(root, Piece);
    backend.simulateBeginDrag([piece.getHandlerId()]);
    expect(piece.render().props.isDragging).toBeFalsy();
  });
});
