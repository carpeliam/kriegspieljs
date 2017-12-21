import React from 'react';
import { Button, Modal } from 'react-bootstrap';

export default class UserNamePrompter extends React.Component {
  _noop() {}
  logIn() {
    this.props.onEnter(this.refs.username.value);
  }
  render() {
    return (
      <Modal show={this.props.user == undefined} onHide={this._noop.bind(this)}>
        <Modal.Header><Modal.Title>Log In</Modal.Title></Modal.Header>
        <Modal.Body>
          <form className="form-horizontal">
            <div className="form-group">
              <label htmlFor="username" className="col-sm-2 control-label">Name</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" name="username" ref="username" placeholder="Name" />
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.logIn.bind(this)}>Let's go!</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
