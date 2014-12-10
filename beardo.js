
var hogan = require('hogan.js')
var debug = require('debug')('beardo')
var cache = require('async-cache')
var path = require('path')
var fs = require('graceful-fs')
var crypto = require('crypto')

module.exports = Beardo

function Beardo(basedir) {
  if (!(this instanceof Beardo)) return new Beardo(basedir)

  if (! basedir) {
    throw new Error('basedir is required.')
  }

  var beardo = this

  beardo.templates = {}
  beardo.basedir = path.resolve(basedir)
  beardo.files = cache({
    load: read
  })

  function read(key, callback) {
    debug('prime cache for %s', key)

    var json = JSON.parse(key)

    fs.readFile(json.file, 'utf8', callback)
  }
}

Beardo.prototype.resolve = function(key) {
  var beardo = this
  var file = path.resolve(beardo.basedir, key)

  return file
}

Beardo.prototype.set = function (key, value) {
  var beardo = this

  beardo.templates[key] = hogan.compile(value)

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

  debug('get: %s', key)

  if (beardo.has(key)) {
    debug('has %s', key)

    var template = beardo.templates[key]

    if (template.partials.length) {
      debug('crap, it has partials')
    } else {
      callback(null, template)
    }
  } else {
    beardo.read(key, callback)
  }
}

Beardo.prototype.render = function(key, context, callback) {
  var beardo = this

  debug('render: %s', key)

  if (typeof context === 'function') {
    callback = context
    context = {}
  }

  callback = callback.bind(beardo)



  beardo.get(key, function(err, template, partials) {
    if (err) return callback(err)

    var output = template.render(context, partials)

    callback(err, output)
  })
}

Beardo.prototype.read = function(key, callback) {
  var beardo = this
  var file = beardo.resolve(key)

  debug('needs data from fs: %s', file)

  fs.stat(file, function(err, stats) {
    if (err) return callback(err)

    var index = hash(file, stats)

    beardo.files.get(index, function(err, data) {
      if (err) return callback(err)

      // // This should be nicer yeah?
      // if (err && err.code === 'ENOENT') err.name = 'Template Not Found'
      // if (err) return callback(err)

      debug('loaded from cache: %s', key)

      beardo.set(key, data)
      beardo.get(key, callback)
    })
  })
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
