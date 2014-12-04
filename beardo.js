
var hogan = require('hogan.js')
var debug = require('debug')('beardo')

module.exports = Beardo

function Beardo(options) {
  if (!(this instanceof Beardo)) return new Beardo(options)

  var beardo = this

  beardo.templates = {}

  // if (typeof options === 'string') {
  //   options = { basedir: options }
  // }
  //
  // var template = this
  //
  // template.basedir = path.resolve(options.basedir)
  // template.collection = {}
}

Beardo.prototype.set = function (key, value) {
  var beardo = this

  beardo.templates[key] = hogan.compile(value)

  // allows chaining like: t.set(k, v).render(ctx, cb)
  return {
    render: beardo.render.bind(beardo, key)
  }
}

Beardo.prototype.has = function(key) {
  return !! this.templates[key]
}

Beardo.prototype.get = function(key, context, callback) {
  var beardo = this

  debug('get: %s', key)

  if (typeof context === 'function') {
    callback = context
    context = {}
  }

  if (beardo.has(key)) {
    debug('has %s', key)

    var template = beardo.templates[key]

    if (template.partials.length) {
      debug('crap, it has partials')
    } else {
      callback(null, template)
    }
  } else {
    debug('need to read from fs %s', key)
  }
}

Beardo.prototype.render = function(key, context, callback) {
  var beardo = this

  debug('render: %s', key)

  beardo.get(key, function(err, template, partials) {
    if (err) return callback(err)

    var output = template.render(context, partials)

    callback(err, output)
  })
}
