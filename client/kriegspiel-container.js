import { connect } from 'react-redux';
import Kriegspiel from './kriegspiel';
import { setUser } from './actions';

function mapStateToProps({ user, game }) {
  return { user, game };
}

function mapDispatchToProps(dispatch) {
  return {
    setUser: username => dispatch(setUser(username))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Kriegspiel);
