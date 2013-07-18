
var beardo = require('../')
  , assert = require('assert')
  , request = require('supertest')
  , cheerio = require('cheerio')

describe('res.tempate = beardo(req, res, options)', function(){
  var server

  before(function(){
    var http = require('http')
      , path = require('path')
      , directory = path.resolve(__dirname, './templates')

    server = http.createServer(function(req, res){
      res.template = beardo(req, res, { directory: directory })

      switch (req.url) {
        case '/vanilla-usage':
          res.template('vanilla')
          break
        case '/vanilla-with-data':
          res.template('vanilla', { title: 'vanilla with data', foo: 'bar' })
          break
        case '/plain-text':
          res.setHeader('content-type', 'text/plain')
          res.template('random-text', { name: 'Chewbacca', layout: 'text' })
          break
        case '/plain-text-no-layout':
          res.setHeader('content-type', 'text/plain')
          res.template('random-text', { name: 'Chewbacca', layout: false })
          break
        case '/teapot':
          res.template('teapot', 418)
          break
        case '/etags':
          var data = { title: 'etags'
              , foo: req.headers['x-foo'] || 'bar'
              }

          res.template('vanilla', data)
          break
        default:
          res.statusCode = 404
          res.end()
      }
    })
  })

  it('successfully renders content from templates', function(done){
    request(server)
    .get('/vanilla-usage')
    .expect('etag', /(.*)/)
    .expect('content-type', 'text/html')
    .expect(200, function(err, res){
      if (err) return done(err)

      var $ = cheerio.load(res.text)

      assert.ok($('#default-layout').length
      , 'Should be wrapped in the layout')

      assert.equal($('header, footer').length, 2
      , 'Should render partials in layouts')

      assert.ok($('h1').text().match(/Vanilla/)
      , 'Should render vanilla.mustache')

      assert.ok($('p').length >= 2, 'Should render partials')
      assert.ok($('p').length >= 3, 'Should render nested partials')

      done()
    })
  })

  it('successfully renders templates with data', function(done){
    request(server)
    .get('/vanilla-with-data')
    .expect('etag', /(.*)/)
    .expect('content-type', 'text/html')
    .expect(200, function(err, res){
      if (err) return done(err)

      var $ = cheerio.load(res.text)

      assert.equal($('title').text(), 'Just testing: vanilla with data')
      assert.equal($('h1').text(), 'Vanilla - foobar')

      done()
    })
  })

  it('does not override pre-existing headers', function(done){
    request(server)
    .get('/plain-text')
    .expect('etag', /(.*)/)
    .expect('content-type', 'text/plain')
    .expect(200, function(err, res){
      if (err) return done(err)
      assert.equal(res.text.replace('\n', '').trim()
      , '=== blah blah Chewbacca ===')
      done()
    })
  })

  it('allows { layout: false }', function(done){
    request(server)
    .get('/plain-text-no-layout')
    .expect('etag', /(.*)/)
    .expect('content-type', 'text/plain')
    .expect(200, function(err, res){
      if (err) return done(err)
      assert.equal(res.text.trim(), 'blah blah Chewbacca')
      done()
    })
  })

  it('optionally sets res.statusCode', function(done){
    request(server)
    .get('/teapot')
    .expect('etag', /(.*)/)
    .expect(418, done)
  })

  describe('cache headers and responses', function(){
    var etag

    before(function(done){
      request(server)
      .get('/etags')
      .expect('etag', /(.*)/)
      .expect(200, function(err, res){
        etag = res.headers['etag']
        done(err)
      })
    })

    it('hanldes if-none-match request headers', function(done){
      request(server)
      .get('/etags')
      .set('if-none-match', etag)
      .expect(304, done)
    })

    it('does NOT 304 changed content', function(done){
      request(server)
      .get('/etags')
      .set('x-foo', 'baz')
      .set('if-none-match', etag)
      .expect(200, done)
    })
  })
})
