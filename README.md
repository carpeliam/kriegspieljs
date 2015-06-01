kriegspiel.js [![Build Status](https://travis-ci.org/carpeliam/kriegspieljs.svg?branch=master)](https://travis-ci.org/carpeliam/kriegspieljs)
=============

[Kriegspiel explained][1]. This is an implementation of Kriegspiel as a
[node.js](http://nodejs.org) application, using [socket.io](http://socket.io)
for pushing moves from the server to the client and back. The code is written
in [CoffeeScript](http://coffeescript.org/).

To run your own Kriegspiel server:

1. clone the repo
2. `npm install`
3. `coffee server.coffee` (or `npm start`)
4. browse to http://localhost:8124
5. invite all of your coolest friends to play with you!

  [1]: http://en.wikipedia.org/wiki/Kriegspiel_(chess)
