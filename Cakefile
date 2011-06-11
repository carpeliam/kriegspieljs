fs = require 'fs'

option '-v', '--verbose [TRUE|FALSE]', 'Turn verbosity on/off (off by default)'
option '-c', '--color [TRUE|FALSE]', 'Turn color on/off (on by default)'
option '-f', '--file [FILE]', 'specific spec file or directory to run'

task 'spec', 'run specs', (options) ->
  jasmine = require 'jasmine-node'
  if options.file
    unless fs.statSync(options.file).isFile()
      target = options.file
    else
      target = __dirname + '/' + options.file
  else
    target = process.cwd() + '/spec'

  jasmine.executeSpecsInFolder target, (runner, log) ->
    process.exit runner.results().failedCount
  , options.verbose or false, options.color or true, "_spec.coffee$"