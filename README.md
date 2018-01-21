kriegspiel.js [![Build Status](https://travis-ci.org/carpeliam/kriegspieljs.svg?branch=master)](https://travis-ci.org/carpeliam/kriegspieljs)
=============

[Kriegspiel explained][1]. This is an implementation of Kriegspiel as a
[node.js](https://nodejs.org) application, using [socket.io](https://socket.io/) for pushing moves
from the server to the client and back. The server was originally written in
[CoffeeScript](http://coffeescript.org/), though is being ported to modern JavaScript; the client
was originally written with jQuery, but has been ported to [React](https://reactjs.org/) and
[Redux](https://redux.js.org/).

To run your own Kriegspiel server:

1. clone the repo
2. `yarn install`
3. `yarn start`
4. browse to http://localhost:8124
5. invite all of your coolest friends to play with you!

  [1]: http://en.wikipedia.org/wiki/Kriegspiel_(chess)
