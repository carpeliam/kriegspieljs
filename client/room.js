import React from 'react';
import { connect } from 'react-redux';
import { sendMessage } from './actions';

function chatMessage({ message, type, author }, i) {
  const msg = (author) ? `${author.name}: ${message}` : message;
  return <div key={i} className={type}>{msg}</div>;
}

export class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = { message: '' };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  onChange(event) {
    this.setState({ message: event.target.value });
  }
  onSubmit(event) {
    event.preventDefault();
    if (this.state.message) {
      this.props.sendMessage(this.state.message);
      this.setState({ message: '' });
    }
  }
  componentDidUpdate({ messages: oldMessages }) {
    const newMessages = this.props.messages;
    if (newMessages.length > oldMessages.length) {
      this.messages.scrollTop = this.messages.scrollHeight;
    }
  }
  render() {
    const { members, messages } = this.props;
    return (
      <div>
        <details open className="members">
          <summary>users</summary>
          {members.map(({ id, name }) => <span key={id}>{name}</span>)}
        </details>
        <div className="messages" ref={elem => (this.messages = elem)}>
          {messages.map(chatMessage)}
        </div>
        <form onSubmit={this.onSubmit}>
          <input
            type="text"
            placeholder="Chat!"
            value={this.state.message}
            onChange={this.onChange}
            style={{ width: '100%' }}
          />
        </form>
      </div>
    );
  }
}

function mapStateToProps({ members, messages }) {
  return { members, messages };
}

function mapDispatchToProps(dispatch) {
  return {
    sendMessage(msg) {
      dispatch(sendMessage(msg));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Room);
