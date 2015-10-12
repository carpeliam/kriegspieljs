import '../client_helper';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import Piece from '../../client/piece';

describe('Piece', () => {
  const OrigPiece = Piece.DecoratedComponent;
  const identity = el => el;
  var component;
  var renderer = TestUtils.createRenderer();
  beforeEach(() => {
    component = TestUtils.renderIntoDocument(<OrigPiece pieceType={1} color={1} connectDragSource={identity} isDragging={false} />);
  });
  it('renders the appropriate piece type', () => {
    renderer.render(<OrigPiece pieceType={1} color={1} connectDragSource={identity} isDragging={false} />);
    var result = renderer.getRenderOutput();
    expect(result.props.children).toEqual('♙');
  });
});
