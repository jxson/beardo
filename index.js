
var http = require('http')

module.exports = function(){
  var directory
    , options
    , req
    , res

  for (var i = 0; i < arguments.length; i ++) {
    var argument = arguments[i]

    switch (argument.constructor) {
      case String: directory = argument; break
      case Object: options = argument; break
      case http.IncomingMessage: req = argument; break
      case http.ServerResponse: res = argument; break
      default: throw new Error('bad argument to beardo()')
    }
  }

  var beardo = new Beardo(options)

  if (req && res) return beardo.decorate(req, res)
  else return beardo
}

var path = require('path')
  , EE = require('events').EventEmitter

function Beardo(options){
  var beardo = this

  beardo.templates = {}
  beardo.partials = {}
  beardo.queue = []
  beardo.isReading = false
  beardo.options = { cache: true
  , directory: path.resolve('templates')
  }

  // configuration, adds key/values to beardo.options
  var allowed = [ 'directory', 'cache' ]

  for (var key in options) {
    if (! key in allowed) return

    if (key === 'directory') beardo.options.directory = path.resolve(options.directory)
    else beardo.options[key] = options[key]
  }

  EE.call(beardo)
}

// Inherit from Event Emitter
Beardo.prototype.__proto__ = EE.prototype

Beardo.prototype.decorate = function(req, res){
  var beardo = this

  return template

  // the res.template decorator
  function template(name, context, status){
    // TODO: req.pipe(beardo('foo', options)).pipe(res)
    beardo.render(name, context, function(err, output){
      if (err) throw err // TODO: do something better with this

      var etag = hash(output)

      res.setHeader('etag', etag)

      // Don't override content-type header
      if (! res.getHeader('content-type')) {
        res.setHeader('content-type', 'text/html')
      }

      res.statusCode = res.statusCode || status || 200
      res.write(output)
      res.end()
    })
  }
}

Beardo.prototype.render = function(name, context, callback){
  var beardo = this
    , context = context || {}

  if (context.layout === undefined) context.layout = 'default'

  // context.layout could be false...
  if (context.layout) {
    beardo.read(path.join('layouts', context.layout))
  }

  beardo.on('error', callback)
  beardo.read(name)

  beardo.on('end', function(){
    var layout = beardo.find(path.join('layouts', context.layout))
      , template = beardo.find(name)
      , output = template.render(context, beardo.partials)

    context.yield = function(){
      return context.layout ? output : null
    }

    if (context.layout) output = layout.render(context, beardo.partials)

    callback(null, output)
  })
}

Beardo.prototype.read = function(name){
  var beardo = this
    , path = require('path')
    , fs = require('graceful-fs')
    , filename = path.join(beardo.options.directory, name)
    , cs = require('concat-stream')

  // don't add the mustache extension if one already exists
  if (path.extname(filename) === '') filename += '.mustache'

  beardo.queue.push(filename)

  fs.createReadStream(filename, { encoding: 'utf8' })
  .pipe(cs(end))

  function end(buffer){
    beardo.add(filename, buffer)

    // remove this page from the queue
    var index = beardo.queue.indexOf(filename)

    beardo.queue.splice(index, 1)

    if (beardo.queue.length === 0) {
      beardo.isReading = false
      beardo.emit('end')
    }
  }
}

Beardo.prototype.find = function(name){
  var beardo = this
    , template = beardo.templates[name]

  // this should never happen outside of development/ regressions
  if (beardo.isReading) throw new Error('No finding while reading!')

  if (! template) {
    name = path.join(beardo.options.directory, name)
    template = beardo.templates[name]
  }

  if (! template) {
    name = name += '.mustache'
    template = beardo.templates[name]
  }

  return template
}

// takes an identifier and a string or buffer and adds it to the template hashes
Beardo.prototype.add = function(identifier, buffer){
  var beardo = this
    , isBuffer = require('buffer').Buffer.isBuffer
    , data = isBuffer(buffer) ? buffer.toString() : buffer
    , hogan = require('hogan.js')

  beardo.templates[identifier] = hogan.compile(data)
  // This is needed to pass into render functions for accessing the relatively
  // named templates
  beardo.partials[normalize(identifier)] = beardo.templates[identifier]

  function normalize(filename){
    return filename
    .replace(beardo.options.directory, '')
    .replace(/^\//, '')
    .replace('.mustache', '')
  }
}

function hash(string){
  return require('crypto')
  .createHash('md5')
  .update(string)
  .digest('base64')
}

