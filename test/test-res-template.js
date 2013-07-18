
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

      assert.equal($('p').length, 2
      , 'Should render partials')

      assert.equal($('p').length, 3
      , 'Should render nested partials')

      done()
    })
  })

  it('successfully renders templates with data')

  it('does not override pre-existing headers')

  it('optionally sets res.statusCode')

  describe('cache headers and responses', function(){
    it('hanldes if-none-match request headers')

    it('does NOT 304 changed content')
  })
})
