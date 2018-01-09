import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { sitAs, stand } from './actions';

const oppositeColorOf = { white: 'black', black: 'white' };

export function Seat({ color, active, winning, losing, user, players, sitAs, stand }) {
  const className = cx(`btn btn-block btn-seat btn-${color}`, { active, winning, losing });
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
    <span className="col-md-6">
      <button className={className} onClick={onClick} disabled={!!disabled}>
        {seatText}
      </button>
    </span>
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
    stand(color) { dispatch(stand()); },
  }
}

export const SeatContainer = connect(mapStateToProps, mapDispatchToProps)(Seat);

export default function SeatList(props) {
  return (
    <div className="row">
      <SeatContainer color="white" />
      <SeatContainer color="black" />
    </div>
  );
}

// export default class SeatList extends React.Component {
//   canSitOrStandAs(color) {
//     if (this.props.playerColor) {
//       return this.props.playerColor == color;
//     } else {
//       return !this.props[color];
//     }
//   }
//   buttonTextFor(color) {
//     if (this.props.playerColor == color) {
//       return 'leave ' + color;
//     } else if (this.props[color]) {
//       return this.props[color];
//     } else {
//       return 'sit as ' + color;
//     }
//   }
//   handleClick(color) {
//     if (this.canSitOrStandAs(color)) {
//       this.props.sitOrStandAs(color);
//     }
//   }
//   render() {
//     return  <div className="row">
//               <span className="col-md-6">
//                 <a className="btn btn-block btn-white"
//                     disabled={!this.canSitOrStandAs('white')}
//                     onClick={this.handleClick.bind(this, 'white')}>{this.buttonTextFor('white')}</a>
//               </span>
//               <span className="col-md-6">
//                 <a className="btn btn-block btn-black"
//                     disabled={!this.canSitOrStandAs('black')}
//                     onClick={this.handleClick.bind(this, 'black')}>{this.buttonTextFor('black')}</a>
//               </span>
//             </div>;
//   }
// }
