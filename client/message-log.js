import React from 'react';

export default class MessageLog extends React.Component {
  handleSubmit(e) {
    e.preventDefault();
    this.props.onMessageSubmit(this.refs.msg.value);
    this.refs.msg.value = '';
  }
  renderMessage({author, msg}, i) {
    return <div key={i}>{(author) ? `${author}: ` : ''}{msg}</div>;
  }
  render() {
    return <div>
      {this.props.messages.map(this.renderMessage)}
      <form onSubmit={this.handleSubmit.bind(this)}>
        <input type="text" ref="msg" />
        <input type="submit" />
      </form>
    </div>;
  }
}
