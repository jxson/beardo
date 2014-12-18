
var template = require('./template')
var cache = require('async-cache')
var path = require('path')
var fs = require('graceful-fs')
var crypto = require('crypto')
var errno = require('errno')
var format = require('util').format
var through = require('through2')
var debug = require('debug')('beardo')

module.exports = Beardo

function Beardo(options) {
  if (!(this instanceof Beardo)) return new Beardo(options)

  var beardo = this

  if (typeof options === 'string') {
    options = { basedir: options }
  }

  if (! options.basedir) {
    throw new Error('options.basedir is required.')
  }

  beardo.basedir = path.resolve(options.basedir)
  beardo.layout = options.layout
  beardo.templates = {} // keeps track of manually added templates
  beardo.files = cache({
    load: read
  })
}

Beardo.prototype.resolve = function(key) {
  var beardo = this
  var file = path.resolve(beardo.basedir, key)

  if (path.extname(file) === '') {
    file += '.mustache'
  }

  return file
}

Beardo.prototype.set = function (key, value) {
  var beardo = this

  debug('set: %s', key)

  beardo.templates[key] = template(key, value)

  // allows chaining like: t.set(k, v).render(ctx, cb)
  return {
    render: beardo.render.bind(beardo, key),
    get: beardo.get.bind(beardo, key)
  }
}

Beardo.prototype.has = function(key) {
  return !! this.templates[key]
}

Beardo.prototype.get = function(key, callback) {
  var beardo = this
  var templates = {}

  debug('get: %s', key)

  queue(beardo, callback)
  .on('error', callback)
  .on('data', function ontemplate(template) {
    templates[template.key] = template
  })
  .on('end', function onend() {
    debug('queue ended')
    callback(null, templates[key], templates)
  })
  .write(key)


  // queue.write(key)

  // Is it manually added?

  // On the fs


  // if (beardo.has(key)) {
  //   debug('has %s', key)
  //
  //   var template = beardo.templates[key]
  //
  //   if (template.partials.length) {
  //     debug('crap, it has partials %o', Object.keys(template.partials))
  //
  //     template.partials.forEach(function(partial) {
  //       queue.write(partial)
  //     })
  //   } else {
  //     // callback(null, template)
  //     debug('no partials')
  //     queue.end()
  //   }
  // } else {
  //   beardo.read(key, function(err, data) {
  //       //
  //
  //     beardo.set(key, data)
  //     beardo.get(key, queue)
  //   })
  // }
}


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

Beardo.prototype.render = function(key, context, callback) {
  var beardo = this
  var layout

  debug('render: %s', key)

  if (typeof context === 'function') {
    callback = context
    context = {}
  }

  callback = callback.bind(beardo)

  // context.layout could be === false
  if (context.layout === undefined) context.layout = 'default'
  if (beardo.layout !== undefined) context.layout = beardo.default

  if (context.layout) {
    layout = path.join('layouts', context.layout)
  }

  beardo.get(key, function(err, template, partials) {
    if (err) return callback(err)

    debug('got %s', key)

    var output = template.render(context, partials)

    if (! layout) {
      return callback(err, output)
    } else {
      context.layout = false
      context['layout-content'] = output

      beardo.render(layout, context, callback)
    }
  })
}

Beardo.prototype.read = function(key, callback) {
  var beardo = this
  var file = beardo.resolve(key)

  // manually added via b.set(k, v)
  if (beardo.has(key)) {
    return callback(null, beardo.templates[key])
  }

  debug('needs data from fs: %s', file)

  fs.stat(file, function(err, stats) {
    if (err) return callback(ferror(err, 'reading template "%s"', key))

    var index = hash(file, stats)

    beardo.files.get(index, function(err, data) {
      if (err) return callback(ferror(err, 'reading template "%s"', key))

      debug('loaded from cache: %s', key)

      callback(null, template(key, data))
    })
  })
}

function read(key, callback) {
  debug('prime cache for %s', key)

  var json = JSON.parse(key)

  fs.readFile(json.file, 'utf8', callback)
}

function hash(file, stats) {
  var h = crypto.createHash('md5')

  h.update(stats.ino.toString())
  h.update(stats.mtime.toString())
  h.update(stats.size.toString())

  return JSON.stringify({
    file: file,
    etag: h.digest('hex')
  })
}

function ferror(err, template) {
  var description = errno.errno[err.errno].description
  var code = errno.errno[err.errno].code
  var fargs = Array.prototype.slice.call(arguments, 1)

  err.message = format.apply(null, fargs)
  err.message += format('\n %s: %s', code, description)

  if (err.path) {
    err.message += format(' [%s]', err.path)
  }

  return err
}
