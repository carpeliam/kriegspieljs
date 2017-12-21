import React from 'react';
import { connect } from 'react-redux';
import { sitAs, standAs } from './actions';

export function Seat(props) {
  const { color, user, players, sitAs, standAs } = props;
  const className = `btn btn-block btn-${color}`;
  const occupant = players[color];
  const disabled = occupant && occupant.id !== user.id;
  let seatText;
  let onClick = () => {};
  if (occupant) {
    seatText = (occupant.id === user.id) ? `leave ${color}` : `${color}: ${occupant.name}`;
    onClick = () => standAs(color);
  } else {
    seatText = `sit as ${color}`;
    onClick = () => sitAs(color, user);
  }
  return (
    <span className="col-md-6">
      <a className={className} onClick={onClick} disabled={!!disabled}>
        {seatText}
      </a>
    </span>
  );
}

function mapStateToProps({ user, game: { players } }) {
  return { user, players };
}

function mapDispatchToProps(dispatch) {
  // return {
  //   sitAs(color, user) { dispatch(sitAs(color, user)); },
  //   standAs(color) { dispatch(standAs(color)); },
  // }
  console.log('mdtp', sitAs);
  return {
    sitAs: (color, user) => dispatch(sitAs(color, user)),
    standAs: (color) => dispatch(standAs(color)),
  };
}

const SeatContainer = connect(mapStateToProps, mapDispatchToProps)(Seat);

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
