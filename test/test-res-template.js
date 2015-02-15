var test = require('tape')
var cheerio = require('cheerio')
var EOL = require('os').EOL
var request = require('supertest')
var http = require('http')
var beardo = require('../lib/res-beardo')
var path = require('path')
var dir = path.resolve(__dirname, './templates')
var engine = beardo(dir)

test('res.template(name, context)', function(t) {
  var context = {
    foo: 'bar',
    title: 'Title to test with'
  }

  var server = http.createServer(function(req, res) {
    res.template = engine(req, res)
    res.template('vanilla', context)
  })

  request(server)
  .get('/')
  .end(function(err, res) {
    t.error(err, 'request should not error')
    t.equal(res.status, 200)
    // Headers
    t.ok(res.headers.etag, 'should have etag header')
    t.ok(res.headers.date, 'should have date header')
    t.equal(res.headers['content-type'], 'text/html')
    t.equal(res.headers['transfer-encoding'], 'chunked')
    t.ok(res.body, 'should have a response body')

    // Content
    var $ = cheerio.load(res.text)
    var layout = $('body').data('layout')

    t.equal(layout, 'default', 'should be wrapped in default layout')
    t.ok($('header').length, 'layout should include header partial')
    t.ok($('footer').length, 'layout should include footer partial')
    t.equal($('h1').text(), context.title, 'should pass context to template')
    t.ok($('.vanilla').length, 'should render template')
    t.ok($('.more-vanilla').length, 'should render partials')
    t.ok($('.even-more-vanilla').length, 'should render nested partials')

    t.end()
  })
})

test('res.template(name, context) - context.layout = "custom"', function(t) {
  var context = {
    foo: 'bar',
    title: 'Title to test with',
    layout: 'custom'
  }

  var server = http.createServer(function(req, res) {
    res.template = engine(req, res)
    res.template('vanilla', context)
  })

  request(server)
  .get('/')
  .end(function(err, res) {
    t.error(err, 'request should not error')
    t.equal(res.status, 200)
    // Headers
    t.ok(res.headers.etag, 'should have etag header')
    t.ok(res.headers.date, 'should have date header')
    t.equal(res.headers['content-type'], 'text/html')
    t.equal(res.headers['transfer-encoding'], 'chunked')
    t.ok(res.body, 'should have a response body')

    // Content
    var $ = cheerio.load(res.text)
    var layout = $('body').data('layout')

    t.equal(layout, 'custom', 'should be wrapped in custom layout')
    t.equal($('h1').text(), context.title, 'should pass context to template')

    t.end()
  })
})

test('res.template(name, context) - pre-existing content-type', function(t) {
  var context = {
    name: 'Chewbacca',
    layout: 'text'
  }

  var server = http.createServer(function(req, res) {
    res.template = engine(req, res)

    res.setHeader('content-type', 'text/plain')
    res.template('random-text', context)
  })

  request(server)
  .get('/')
  .end(function(err, res) {
    t.error(err, 'request should not error')
    t.equal(res.status, 200)
    t.ok(res.headers.etag, 'should have etag header')
    t.ok(res.headers.date, 'should have date header')
    t.equal(res.headers['content-type'], 'text/plain')
    t.equal(res.headers['transfer-encoding'], 'chunked')
    t.ok(res.body, 'should have a response body')

    // Content
    var regex = new RegExp(EOL, 'g')
    var body = res.text.replace(regex, '')

    t.equal(body, '=== Rawr rawr Chewbacca ===')

    t.end()
  })
})

test('res.template(name, context) - context.layout = flase', function(t) {
  var context = {
    name: 'Chewbacca',
    layout: false
  }

  var server = http.createServer(function(req, res) {
    res.template = engine(req, res)

    res.setHeader('content-type', 'text/plain')
    res.template('random-text', context)
  })

  request(server)
  .get('/')
  .end(function(err, res) {
    t.error(err, 'request should not error')
    t.equal(res.status, 200)
    // Headers
    t.ok(res.headers.etag, 'should have etag header')
    t.ok(res.headers.date, 'should have date header')
    t.equal(res.headers['content-type'], 'text/plain')
    t.equal(res.headers['transfer-encoding'], 'chunked')
    t.ok(res.body, 'should have a response body')

    // Content
    var regex = new RegExp(EOL, 'g')
    var body = res.text.replace(regex, '')

    t.equal(body, 'Rawr rawr Chewbacca')

    t.end()
  })
})

test('res.template(name, status)', function(t) {
  var dir = path.resolve(__dirname, './templates')
  var template = beardo(dir)

  var server = http.createServer(function(req, res) {
    res.template = engine(req, res)
    res.template('teapot', 418)
  })

  request(server)
  .get('/')
  .end(function(err, res) {
    t.error(err, 'request should not error')

    var status = res.status
    var headers = res.headers
    var body = res.text

    t.equal(status, 418)
    t.ok(headers.etag, 'should have etag header')
    t.ok(headers.date, 'should have date header')
    t.equal(headers['content-type'], 'text/html')
    t.equal(headers['transfer-encoding'], 'chunked')
    t.ok(body.match('I\'m a teapot'), 'should have template content')
    t.end()
  })
})

test('cache headers and responses', function(t) {
  var server = http.createServer(function(req, res) {
    var context = {
      // Similates and enadbles data manipulation between etags
      hero: req.headers['x-hero'] || 'Luke'
    }

    res.template = engine(req, res)
    res.template('vanilla', context)
  })

  var agent = request(server)

  agent
  .get('/')
  .end(function(err, res) {
    t.error(err, 'GET should not error')
    t.equal(res.status, 200)
    t.ok(res.headers.etag, 'should have etag header')

    var etag = res.headers.etag

    agent
    .get('/')
    .set('if-none-match', etag)
    .end(function(err, res) {
      t.error(err, 'GET should not error')
      t.equal(res.status, 304, 'should be 304 not modified')
      t.notOk(res.text, 'should not have a body')
    })

    // NOTE: The header x-hero updates the context object used by res.render
    // for this server.
    //
    // This chages the context object used by the server, simulating things
    // like changing data objects (like a database update) where exact
    // matches from templates night occur between client requests but the
    // context object might get updated.
    agent
    .get('/')
    .set('if-none-match', etag)
    .set('x-hero', 'Hon Solo')
    .end(function(err, res) {
      t.error(err, 'GET should not error')
      t.equal(res.status, 200, 'should be 200 ok')
      t.ok(res.text, 'should have a body')
      t.end()
    })
  })
})
