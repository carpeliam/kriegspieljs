import React from 'react';
import { render } from 'react-dom';
import Modal from 'react-modal';
import App from './app';

import './style/index.scss';

Modal.setAppElement('#game');
Modal.defaultStyles = Object.assign(Modal.defaultStyles, {
  content: Object.assign(Modal.defaultStyles.content, {
    top: '150px',
    left: '20%',
    right: '20%',
    bottom: undefined,
  }),
});

render(<App />, document.getElementById('game'));
