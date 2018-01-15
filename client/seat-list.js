import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { sitAs, stand } from './actions';

const oppositeColorOf = { white: 'black', black: 'white' };

export function Seat({ color, active, winning, losing, user, players, sitAs, stand }) {
  const className = cx(`btn-seat btn-${color}`, { active, winning, losing });
  const occupant = players[color];
  const opponent = players[oppositeColorOf[color]];
  const disabled = (occupant && occupant.id !== user.id) || (opponent && opponent.id === user.id);
  let seatText;
  let onClick;
  if (occupant) {
    seatText = (occupant.id === user.id) ? `leave ${color}` : `${color}: ${occupant.name}`;
    onClick = () => stand();
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

function mapStateToProps({ user, game: { players, board: { turn }, mate } }, { color }) {
  const active = (turn < 0) ? color === 'black' : color === 'white';
  const props = { user, players, winning: mate && !active, losing: mate && active };
  if (players.white && players.black) {
    props.active = active;
  }
  return props;
}

function mapDispatchToProps(dispatch) {
  return {
    sitAs(color, user) { dispatch(sitAs(color, user)); },
    stand() { dispatch(stand()); },
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
