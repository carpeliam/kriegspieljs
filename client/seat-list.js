import React from 'react';

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
  handleClick(color) {
    if (this.canSitOrStandAs(color)) {
      this.props.sitOrStandAs(color);
    }
  }
  render() {
    return  <div className="row">
              <span className="col-md-6">
                <a className="btn btn-block btn-white"
                    disabled={!this.canSitOrStandAs('white')}
                    onClick={this.handleClick.bind(this, 'white')}>{this.buttonTextFor('white')}</a>
              </span>
              <span className="col-md-6">
                <a className="btn btn-block btn-black"
                    disabled={!this.canSitOrStandAs('black')}
                    onClick={this.handleClick.bind(this, 'black')}>{this.buttonTextFor('black')}</a>
              </span>
            </div>;
  }
}
