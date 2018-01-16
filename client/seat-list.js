import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cx from 'classnames';
import { sitAs, stand, offerResignation } from './actions';

const oppositeColorOf = { white: 'black', black: 'white' };

export function Seat({ color, active, inProgress, winning, losing, user, players, sitAs, stand, resign }) {
  const className = cx(`btn-seat btn-${color}`, { active, winning, losing });
  const occupant = players[color];
  const opponent = players[oppositeColorOf[color]];
  const disabled = (occupant && occupant.id !== user.id) || (opponent && opponent.id === user.id);
  let seatText;
  let onClick;
  if (occupant) {
    if (inProgress) {
      seatText = (occupant.id === user.id) ? `resign as ${color}` : `${color}: ${occupant.name}`;
      onClick = () => resign();
    } else {
      seatText = (occupant.id === user.id) ? `leave ${color}` : `${color}: ${occupant.name}`;
      onClick = () => stand();
    }
  } else {
    seatText = `sit as ${color}`;
    onClick = () => sitAs(color, user);
  }
  return (
    <button className={className} onClick={onClick} disabled={!!disabled}>
      {seatText}
    </button>
  );
}
Seat.propTypes = {
  color: PropTypes.oneOf(['white', 'black']).isRequired,
  active: PropTypes.bool,
  inProgress: PropTypes.bool.isRequired,
  winning: PropTypes.bool.isRequired,
  losing: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  players: PropTypes.object.isRequired,
  sitAs: PropTypes.func.isRequired,
  stand: PropTypes.func.isRequired,
  resign: PropTypes.func.isRequired,
};

function mapStateToProps({ user, game: { players, board: { turn, inProgress }, mate } }, { color }) {
  const active = (turn < 0) ? color === 'black' : color === 'white';
  const opposingColor = (color === 'black') ? 'white' : 'black';
  const winning = (players[opposingColor] && players[opposingColor].resigned) || (mate && !active);
  const losing = (players[color] && players[color].resigned) || (mate && active);
  const props = { user, players, inProgress, winning, losing };
  if (players.white && players.black) {
    props.active = active;
  }
  return props;
}

function mapDispatchToProps(dispatch) {
  return {
    sitAs(color, user) { dispatch(sitAs(color, user)); },
    stand() { dispatch(stand()); },
    resign() { dispatch(offerResignation()); },
  }
}

export const SeatContainer = connect(mapStateToProps, mapDispatchToProps)(Seat);

export default function SeatList(props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <SeatContainer color="white" />
      <SeatContainer color="black" />
    </div>
  );
}
