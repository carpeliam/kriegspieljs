import React from 'react';
import { render } from 'react-dom';
import Modal from 'react-modal';
import App from './app';

import './style/index.scss';

Modal.setAppElement('#game');
render(<App />, document.getElementById('game'));
