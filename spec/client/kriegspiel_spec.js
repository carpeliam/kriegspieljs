import '../client_helper';

import {Client, Server} from 'mocket-io';

import Kriegspiel from '../../client/kriegspiel';


describe('Kriegspiel', () => {
  var server = new Server();
  var client = new Client(server);
  var io = client.connect;
  
});
