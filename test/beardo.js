
var beardo = require('../')
  , path = require('path')
  , assert = require('assert')
  , http = require('http')
  , request = require('request')

describe('beardo', function(){
  it('require returns a beardo instance', function(){
    assert.ok(beardo, 'beardo is undefined. WTF?')
    assert.ok(beardo.directory, 'Missing `directory` property')
    assert.equal(typeof beardo.read, 'function', 'Missing `read` method')
  })
})

describe('beardo.directory', function(){
  it('defaults to `process.cwd()`', function(){
    assert.equal(beardo.directory, path.resolve('templates'))
  })

  it('is writeable', function(){
    beardo.directory = path.join(__dirname, './templates')

    assert.equal(beardo.directory, path.join(__dirname, './templates'))
  })
})

describe('beardo.read', function(){
  before(function(){
    beardo.directory = path.join(__dirname, './templates')
  })

  it('reads templates', function(done){
    beardo.read('basic', function(err, template){
      if (err) return done(err)

      assert.ok(template, 'Missing `template` argument')
      assert.equal(template.render({ text: 'foo' }), 'basic tom fooery')

      done()
    })
  })

  it('reads templates with partials', function(done){
    beardo.read('has-partial', function(err, template){
      if (err) return done(err)

      assert.ok(template, 'Missing `template` argument')
      assert.equal(template.render(), 'partial! w007')

      done()
    })
  })

  it('reads templates with nested partials', function(done){
    beardo.read('has-nested-partials', function(err, tpl){
      if (err) return done(err)

      assert.ok(tpl, 'Missing `template` argument')
      assert.equal(tpl.render(), 'A dream, within a dream, within a dream')

      done()
    })
  })

  it('errs on non-existing templates', function(done){
    beardo.read('bogus', function(err, template){
      assert.ok(err, 'Missing `error`')
      assert.equal(err.code, 'ENOENT', 'Bad `error.code`')
      assert.equal(template, undefined, '`template` should be `undefined`')

      done()
    })
  })
})

describe('beardo.layouts', function(){
  before(function(){
    beardo.directory = path.join(__dirname, './templates')
  })

  it('reads the layouts dir', function(done){
    beardo.layouts(function(err, layouts){
      if (err) return done(err)

      assert.ok(layouts)
      assert.ok(layouts['layouts/default'])
      assert.equal(layouts['layouts/default'].render(), '===  ===')

      done()
    })
  })

  it('allows templates with layouts', function(done){
    beardo.layouts(function(err, layouts){
      if (err) return done(err)

      beardo.read('needs-layout', function(err, tpl){
        if (err) return done(err)

        assert.ok(tpl, 'Missing `template` argument')
        assert.equal(tpl.render({ layout: 'default' }), '=== gimme danger ===')

        done()
      })
    })
  })
})

describe('beard.handler', function(){
  var options = { directory: path.join(__dirname, './templates') }
    , port = process.env.PORT || 1337
    , server
    , get

  server = http.createServer(function(req, res) {
    // console.log()
    // console.log('!!! req.headers', req.headers)
    // console.log()

    res.template = beardo.handler(req, res, options)

    // pluck the if-none-match off the headers, since
    // we'll be changing that one up.
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

      default:
        res.statusCode = 404
        return res.end()
    }
  })

  get = function get(options, callback){
    var options = options || {}
      , host = 'http://localhost:' + port

    if (typeof options === 'string') options = { url: host + options }
    else options.url = host + options.url

    // options.url =

    // console.log('options', options)

    // options.url = options.url ||
    // var url = 'http://localhost:' + port + url

    request(options, callback)
  }

  it('exists', function(){
    assert.equal(typeof beardo.handler, 'function', 'Missing `handle` method')
  })

  describe('responding with templates', function(){
    var etag // for the cache tests

    before(function(done){
      server.listen(port, done)
    })

    it('responds with rendered content', function(done){
      get('/heyo', function(err, res, body){
        if (err) return done(err)

        var headers = { host: 'localhost:' + (process.env.PORT || 1337)
            , connection: 'keep-alive'
            }

        // Save this for the next test
        etag = res.headers.etag

        assert.equal(res.statusCode, 200, 'Response is NOT 200 OK')
        assert.ok(res.headers.etag, 'Missing etag')
        assert.equal(res.headers['content-type'], 'text/html')
        assert.ok(res.headers['date'], 'Missing date header')
        assert.equal(res.headers['connection'], 'keep-alive')
        assert.equal(res.headers['transfer-encoding'], 'chunked')
        assert.equal(res.body, [ '<html>'
        , '<body>'
        , '<h1>HEYO</h1>'
        , '<pre>' + JSON.stringify(headers) + '</pre>'
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

        assert.equal(res.statusCode, 200, 'Response is NOT 200 OK')
        assert.ok(res.headers.etag, 'Missing etag')
        assert.equal(res.headers['content-type'], 'text/html')
        assert.ok(res.headers['date'], 'Missing date header')
        assert.equal(res.headers['connection'], 'keep-alive')
        assert.equal(res.headers['transfer-encoding'], 'chunked')
        assert.equal(res.body, [ '<html>'
        , '<body>'
        , '<h1>HEYO</h1>'
        , '<pre>' + JSON.stringify(headers) + '</pre>'
        , '</body>'
        , '</html>'
        ].join('\n'))

        done()
      })
    })

    it('does NOT override headers')
    // * 200
    // * has e-tag
    // * content-type === 'text/plain'
    // * date
    // * connection === 'keep-alive'
    // * transfer-encoding === 'chunked'
    // * rendered body

    it('retains the stamp passed into the options')

    it('responds with rendered partials')

    it('responds with not-found page')
    // * 400
    // * has e-tag
    // * content-type === 'text/plain'
    // * date
    // * connection === 'keep-alive'
    // * transfer-encoding === 'chunked'
    // * rendered body
  })
})
