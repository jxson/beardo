var beardo = require('./beardo')
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
  var templates = beardo(options)

  templates.layout = 'default'

  engine.beardo = templates
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

      res.setHeader('etag', etag)

      debug('req.etag %s', req.headers['if-none-match'])
      debug('etag: %s', etag)

      if (req.headers['if-none-match'] === etag) {
        res.writeHead(304)
      } else {
        res.writeHead(status || 200)
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
