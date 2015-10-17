import React, {PropTypes} from 'react';
import { DropTarget } from 'react-dnd';

const squareTarget = {
  canDrop(props, monitor) {
    return props.canDrop(monitor.getItem(), {x: props.x, y: props.y});
  },
  drop(props, monitor) {
    props.drop(monitor.getItem(), {x: props.x, y: props.y});
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
}

class Square extends React.Component {
  render() {
    const { x, y, connectDropTarget, isOver, canDrop } = this.props;
    return connectDropTarget(<div>
       {this.props.children}
    </div>);
  }
}

Square.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired
};

export default DropTarget('piece', squareTarget, collect)(Square);