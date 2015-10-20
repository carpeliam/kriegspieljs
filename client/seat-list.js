import React from 'react';
import { ButtonToolbar } from 'react-bootstrap';

export default class SeatList extends React.Component {
  canSitOrStandAs(color) {
    if (this.props.playerColor) {
      return this.props.playerColor == color;
    } else {
      return !this.props[color];
    }
  }
  buttonTextFor(color) {
    if (this.props.playerColor == color) {
      return 'leave ' + color;
    } else if (this.props[color]) {
      return this.props[color];
    } else {
      return 'sit as ' + color;
    }
  }
  render() {
    return  <ButtonToolbar>
              <a className="btn btn-white"
                disabled={!this.canSitOrStandAs('white')}
                onClick={this.props.sitOrStandAs.bind(this, 'white')}>{this.buttonTextFor('white')}</a>
              <a className="btn btn-black"
                disabled={!this.canSitOrStandAs('black')}
                onClick={this.props.sitOrStandAs.bind(this, 'black')}>{this.buttonTextFor('black')}</a>
            </ButtonToolbar>;
  }
}
