
var beardo = require('../')
  , path = require('path')
  , assert = require('assert')
  , http = require('http')
  , request = require('request')
  , PORT = process.env.PORT || 1337
  , beardopts = { directory: path.join(__dirname, './templates')
    , stamp: 'stamp-' + process.pid
    }
  , server
  , get
  , etag // for the cache tests

server = http.createServer(function(req, res) {
  res.template = beardo.handler(req, res, beardopts)

  // Use the headers as a proxy for the way folks treat the `context` for
  // rendering the templates. Make sure to remove the if-none-match header
  // since it will change the etag between requests for the same template and
  // context
  var h = Object.keys(req.headers).filter(function (k) {
    return k !== 'if-none-match'
  }).reduce(function (s, k) {
    s[k] = req.headers[k]
    return s
  }, {})

  var headers = JSON.stringify(h)

  switch (req.url) {
    case '/heyo':
      return res.template('heyo', { headers: headers, layout: 'html' })

    case '/basic':
      res.setHeader('content-type', 'text/plain')
      return res.template('basic', { text: 'foo' })

    case '/stamp':
      return res.template('stamp', { stamp: beardopts.stamp })

    case '/404':
      return res.template('404', 404)

    default:
      res.statusCode = 404
      return res.end()
  }
})

get = function get(options, callback){
  var options = options || {}
    , host = 'http://localhost:' + PORT

  if (typeof options === 'string') options = { url: host + options }
  else options.url = host + options.url

  request(options, callback)
}

describe('beard.handler', function(){
  before(function(done){
    server.listen(PORT, done)
  })

  after(function(done){
    server.close(done)
  })

  it('exists', function(){
    assert.equal(typeof beardo.handler, 'function', 'Missing `handle` method')
  })

  it('responds with rendered content', function(done){
    get('/heyo', function(err, res, body){
      if (err) return done(err)

      var h = { host: 'localhost:' + (process.env.PORT || 1337)
          , connection: 'keep-alive'
          }

      // Save this for the next test
      etag = res.headers.etag

      assert.equal(res.statusCode, 200)
      assert.ok(res.headers.etag, 'Missing etag')
      assert.equal(res.headers['content-type'], 'text/html')
      assert.ok(res.headers['date'])
      assert.equal(res.headers['connection'], 'keep-alive')
      assert.equal(res.headers['transfer-encoding'], 'chunked')
      assert.equal(body, [ '<html>'
      , '<body>'
      , '<h1>HEYO</h1>'
      , '<pre>' + JSON.stringify(h) + '</pre>'
      , '<p>w007</p>'
      , '</body>'
      , '</html>'
      ].join('\n'))

      done()
    })
  })

  it('responds to cache requests', function(done){
    var options = { url: '/heyo'
        , headers: { 'if-none-match': etag }
        }

    get(options, function(err, res, body){
      if (err) return done(err)

      assert.equal(res.statusCode, 304)
      assert.equal(body, undefined)

      done()
    })
  })

  it('responds to cache requests with changed content', function(done){
    var options = { url: '/heyo'
        , headers: { 'if-none-match': etag
          , 'x-changes-context-so-it-shoud-not-cache': 'foo'
          }
        }

    var headers = { 'x-changes-context-so-it-shoud-not-cache': 'foo'
        , host: 'localhost:' + (process.env.PORT || 1337)
        , connection: 'keep-alive'
        }

    get(options, function(err, res, body){
      if (err) return done(err)

      assert.equal(res.statusCode, 200)
      assert.ok(res.headers.etag)
      assert.equal(res.headers['content-type'], 'text/html')
      assert.ok(res.headers['date'], 'Missing date header')
      assert.equal(res.headers['connection'], 'keep-alive')
      assert.equal(res.headers['transfer-encoding'], 'chunked')
      assert.equal(res.body, [ '<html>'
      , '<body>'
      , '<h1>HEYO</h1>'
      , '<pre>' + JSON.stringify(headers) + '</pre>'
      , '<p>w007</p>'
      , '</body>'
      , '</html>'
      ].join('\n'))

      done()
    })
  })

  it('does NOT override headers', function(done){
    get('/basic', function(err, res, body){
      if (err) return done(err)

      assert.equal(res.statusCode, 200)
      assert.ok(res.headers.etag)
      assert.equal(res.headers['content-type'], 'text/plain')
      assert.ok(res.headers.date)
      assert.equal(res.headers.connection, 'keep-alive')
      assert.equal(res.headers['transfer-encoding'], 'chunked')
      assert.equal(body, 'basic tom fooery')

      done()
    })
  })

  it('retains the stamp passed into the options', function(done){
    get('/stamp', function(err, res, body){
      if (err) return done(err)

      assert.equal(res.statusCode, 200)
      assert.ok(res.headers.etag)
      assert.equal(res.headers['content-type'], 'text/html')
      assert.ok(res.headers.date)
      assert.equal(res.headers.connection, 'keep-alive')
      assert.equal(res.headers['transfer-encoding'], 'chunked')
      assert.equal(res.headers['x-beardo-stamp'], beardopts.stamp)
      assert.equal(body, 'stamp = ' + beardopts.stamp)

      done()
    })
  })

  it('responds with not-found page', function(done){
    get('/404', function(err, res, body){
      if (err) return done(err)

      assert.equal(res.statusCode, 404)
      assert.ok(res.headers.etag)
      assert.equal(res.headers['content-type'], 'text/html')
      assert.ok(res.headers.date)
      assert.equal(res.headers.connection, 'keep-alive')
      assert.equal(res.headers['transfer-encoding'], 'chunked')
      assert.equal(body, '<h1>404</h1>')

      done()
    })
  })
})
