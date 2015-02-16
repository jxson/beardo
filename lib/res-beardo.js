var beardo = require('./beardo').ctor
var debug = require('debug')('beardo:res.template')
var crypto = require('crypto')

module.exports = create

function create(options) {
  var engine = new Engine(options)
  return engine.serve.bind(engine)
}

function Engine(options) {
  debug('new engine')

  var engine = this

  engine.beardo = beardo(options)
}

Engine.prototype.serve = function(req, res) {
  var engine = this
  var beardo = engine.beardo
  debug('serve')

  // this becomes res.template
  return function tempate(name, context, status) {
    debug('template')

    if (typeof context === 'number') {
      status = context
      context = {}
    }

    beardo.render(name, context, function onrender(err, output){
      // TODO: do something better with this
      if (err) throw err

      // default to text/html but don't override content-type header
      if (! res.getHeader('content-type')) {
        res.setHeader('content-type', 'text/html')
      }

      var etag = hash(output)

      debug('req.etag %s', req.headers['if-none-match'])
      debug('etag: %s', etag)

      if (req.headers['if-none-match'] === etag) {
        res.statusCode = 304
      } else {
        res.statusCode = status || 200
        res.setHeader('etag', hash(output))
        res.write(output)
      }

      res.end()
    })

  }
}

function hash(string) {
  var h = crypto.createHash('md5')
  h.update(string)
  return h.digest('hex')
}