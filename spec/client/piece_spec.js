import '../client_helper';
import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
// import TestBackend from 'react-dnd-test-backend';
// import { DragDropContext } from 'react-dnd';
import Piece from '../../client/piece';

// TODO figure out how to test dnd w/React 0.14
// function wrapInTestContext(DecoratedComponent) {
//   return DragDropContext(TestBackend)(
//     class TestContextContainer extends React.Component {
//       render() {
//         return <DecoratedComponent {...this.props} />;
//       }
//     }
//   );
// }

describe('Piece', () => {
  const OrigPiece = Piece.DecoratedComponent;
  const identity = el => el;
  var renderer = TestUtils.createRenderer();

  function getRenderedResult(props = {}) {
    renderer.render(<OrigPiece pieceType={props.pieceType || 1} color={props.color || 1} connectDragSource={props.connectDragSource || identity} isDragging={props.isDragging || false} />);
    return renderer.getRenderOutput();
  }

  // TODO figure out how to test dnd w/React 0.14
  // function getRenderedContext(Context, props = {}) {
  //   renderer.render(<Context pieceType={props.pieceType || 1} color={props.color || 1} />);
  //   return renderer.getRenderOutput();
  // }

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

  // TODO figure out how to test dnd w/React 0.14
  // it('can be dragged if a drag source allows it', () => {
  //   const PieceContext = wrapInTestContext(Piece);
  //   const root = getRenderedContext(PieceContext);
  //   // const root = TestUtils.renderIntoDocument(<PieceContext pieceType={1} color={1} />);

  //   // const backend = root.getManager().getBackend();
  //   debugger;
  // //   var result = getRenderedResult({connectDragSource: () => {
  // //     canDrag() { return true; }
  // //   }})
  // });
});
