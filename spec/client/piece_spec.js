import '../client_helper';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import Piece from '../../client/piece';

describe('Piece', () => {
  const OrigPiece = Piece.DecoratedComponent;
  const identity = el => el;
  var renderer = TestUtils.createRenderer();

  function getRenderedResult(props = {}) {
    renderer.render(<OrigPiece pieceType={props.pieceType || 1} color={props.color || 1} connectDragSource={props.connectDragSource || identity} isDragging={props.isDragging || false} />);
    return renderer.getRenderOutput();
  }

  it('renders the appropriate piece type', () => {
    var result = getRenderedResult();
    expect(result.props.children).toEqual('♙');
  });
  
  it('renders the appropriate color', () => {
    var result = getRenderedResult({color: -1});
    expect(result.props.children).toEqual('♟');
  });

  it('is opaque if not currently being dragged', () => {
    var result = getRenderedResult({isDragging: false});
    expect(result.props.style.opacity).toEqual(1);
  });

  it('is 50% transparent if currently being dragged', () => {
    var result = getRenderedResult({isDragging: true});
    expect(result.props.style.opacity).toEqual(0.5);
  });
});
