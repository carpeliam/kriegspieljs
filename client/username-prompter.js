import React from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import { setUser } from './actions';

export class UserNamePrompter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: '' };
    this.onNameChange = this.onNameChange.bind(this);
    this.logIn = this.logIn.bind(this);
  }
  onNameChange(event) {
    this.setState({ name: event.target.value });
  }
  logIn(e) {
    e.preventDefault();
    this.props.setUser(this.state.name);
  }
  render() {
    const userName = this.props.user.name;
    return (
      <Modal isOpen={!userName} className="modal" style={{ content: { width: 350 } }}>
        <h2>Who are you?</h2>
        <form onSubmit={this.logIn}>
          <input autoFocus type="text" name="username" placeholder="Name" onChange={this.onNameChange} />
          <button type="submit" style={{ marginLeft: 5 }}>Let's go!</button>
        </form>
      </Modal>
    );
  }
}

function mapStateToProps({ user }) {
  return { user };
}

function mapDispatchToProps(dispatch) {
  return {
    setUser: username => dispatch(setUser(username)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserNamePrompter);
