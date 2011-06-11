# require 'coffee-script'
process.addListener 'uncaughtException', (err, stack) ->
  console.log 'EXCEPTION: ' + err
  console.log stack

process.chdir __dirname

Kriegspiel = require './lib/kriegspiel'
new Kriegspiel()