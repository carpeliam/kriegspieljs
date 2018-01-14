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
  logIn() {
    this.props.setUser(this.state.name);
  }
  render() {
    const userName = this.props.user.name;
    return (
      <Modal isOpen={!userName}>
        <h1>Log In</h1>
          <form className="form-horizontal">
            <div className="form-group">
              <label htmlFor="username" className="col-sm-2 control-label">Name</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" name="username" placeholder="Name" onChange={this.onNameChange} />
              </div>
            </div>
          </form>
        <footer>
          <button onClick={this.logIn}>Let's go!</button>
        </footer>
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
