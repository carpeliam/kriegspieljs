import React from 'react';
import { createStore } from 'redux';
import { mount, render } from 'enzyme';
import DragLayer from '../../client/drag-layer';

const SnapLayerContainer = DragLayer.DecoratedComponent;

xdescribe('SnapLayer', () => {
  let store;
  let container;
  beforeEach(() => {
    store = createStore(state => state, {
      game: { board: { squares: [[3]] } },
    });
  });
  describe('when not dragging', () => {
    beforeEach(() => {
      container = render(<SnapLayerContainer store={store} isDragging={false} />);
    });
    it('rend  ers nothing', () => {
      console.log(container);
      // expect(container).toBeNull();
    });
  });
});
