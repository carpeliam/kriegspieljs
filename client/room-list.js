import React from 'react';

export default class RoomList extends React.Component {
  render() {
    return <details open={this.props.members.length > 0}>
      <summary>peeps</summary>
      <p id="people">
        {this.props.members.map(({id, name}) => {
          return <span key={id}>{name}</span>
        })}
      </p>
    </details>;
  }
}
