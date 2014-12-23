
var through = require('through2')
var debug = require('debug')

module.exports = queue

function queue(beardo) {
  var queue = through.obj(write, flush)
  var debug = require('debug')('queue')

  debug('creating queue')

  queue.templates = {}

  return queue

  function write(chunk, enc, callback) {
    var queue = this
    var key = chunk.toString()

    debug('queued - %s', chunk)

    beardo.read(key, function onread(err, template) {
      if (err) return callback(err)

      queue.push(template)
      callback()

      if (template.partials.length === 0) {
        queue.end()
      } else {
        template.partials.forEach(function(partial) {
          queue.write(partial)
        })
      }
    })
  }

  function flush(callback) {
    debug('flushing')
    callback()
  }
}
