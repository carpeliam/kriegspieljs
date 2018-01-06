import React from 'react';
import { connect } from 'react-redux';

export function Room(props) {
  const { members } = props;
  return (
    <details open>
      {members.map(({ id, name }) => <span key={id}>{name}</span>)}
    </details>
  );
}

export default connect(({ members }) => ({ members }))(Room);
