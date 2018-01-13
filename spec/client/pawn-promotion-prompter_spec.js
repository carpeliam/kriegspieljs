import React from 'react';
import { shallow, mount } from 'enzyme';
import { Modal } from 'react-bootstrap';
import PawnPromotionPrompterContainer, { PawnPromotionPrompter } from '../../client/pawn-promotion-prompter';
import { createStore } from 'redux';
import * as actions from '../../client/actions';

describe('PawnPromotionPrompter', () => {
  let component;
  let onSelectionSpy;
  beforeEach(() => {
    onSelectionSpy = jasmine.createSpy('onSelection');
    component = shallow(<PawnPromotionPrompter
      shouldShow={true}
      turn={1}
      onSelection={onSelectionSpy}
    />);
  });
  it('is visible if there is a pawn advancement opportunity', () => {
    expect(component.find(Modal)).toHaveProp('show', true);
  });
  it('renders the right color pieces', () => {
    const modalBody = component.find(Modal.Body).dive();
    expect(modalBody).toIncludeText('♘');
    expect(modalBody).toIncludeText('♗');
    expect(modalBody).toIncludeText('♖');
    expect(modalBody).toIncludeText('♕');
  });
  it('calls onSelection upon selecting a piece', () => {
    component.find('button').first().simulate('click');
    expect(onSelectionSpy).toHaveBeenCalledWith(2);
    component.find('button').last().simulate('click');
    expect(onSelectionSpy).toHaveBeenCalledWith(5);
  });
});

describe('PawnPromotionPromoterContainer', () => {
  let store;
  let container;
  beforeEach(() => {
    spyOn(actions, 'onPromotionSelection').and.returnValue({ type: 'on selection' });
    store = createStore(state => state, {
      user: { id: 'abc123', name: 'Bobby' },
      game: {
        pawnAdvance: { x: 1, y: 2 },
        players: { white: { id: 'abc123', name: 'Bobby' } },
        board: { turn: 1 },
      },
    });
    spyOn(store, 'dispatch');
    container = shallow(<PawnPromotionPrompterContainer store={store} />);
  });
  it('passes the current turn, promotion square, and whether or not the modal should show itself based on whether the current player has a turn', () => {
    expect(container.find(PawnPromotionPrompter)).toHaveProp('turn', 1);
    expect(container.find(PawnPromotionPrompter)).toHaveProp('turn', 1);
    expect(container.find(PawnPromotionPrompter)).toHaveProp('shouldShow', true);
  });
  it('passes onSelection action down to child component', () => {
    container.find(PawnPromotionPrompter).props().onSelection(5);
    expect(actions.onPromotionSelection).toHaveBeenCalledWith({ x: 1, y: 2 }, 5);
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'on selection' });
  });
});
