var test = require('tape')
var cheerio = require('cheerio')
var beardo = require('../').ctor
var path = require('path')
var basedir = path.resolve(__dirname, './templates')
var b = beardo(basedir)

test('b.render(name, callback) - name without extension', function(t) {
  b.render('coffee-ipsum', function(err, output) {
    t.error(err, 'b.render(...) should not error')
    t.ok(output, 'should have output')
    t.ok(output.match('Coffee ipsum'), 'should render template output')
    t.end()
  })
})

test('b.render(name, callback) - name with extension', function(t) {
  b.render('coffee-ipsum.mustache', function(err, output) {
    t.error(err, 'b.render(...) should not error')
    t.ok(output, 'should have output')
    t.ok(output.match('Coffee ipsum'), 'should render template output')
    t.end()
  })
})

test('b.render(name, context, callback)', function(t) {
  var context = {
    name: 'Chebacca',
    quote: 'RAWRRRR!'
  }

  b.render('quote', context, function(err, output) {
    t.error(err, 'b.render(...) should not error')
    t.ok(output, 'should have output')
    t.equal(output.trim(), 'Chebacca says RAWRRRR!')
    t.end()
  })
})

test('b.render(name, callback) - error: non-existing template', function(t) {
  const ENOENT = require('errno').code.ENOENT

  b.render('does-not-exist', function(err, output) {
    t.ok(err, 'b.render(...) should error')
    t.ok(err.message.match('does-not-exist'), 'should have a nice message')
    t.equal(err.errno, ENOENT.errno)
    t.equal(err.code, ENOENT.code)
    t.end()
  })
})

test('b.render(name, context, callback) - context.layout set', function(t) {
  var context = {
    layout: 'text',
    name: 'Hon Solo',
    quote: 'shoot first'
  }

  b.render('quote', context, function(err, output) {
    t.error(err, 'b.render(...) should not error')
    t.ok(output, 'should have output')
    t.equal(output.trim(), '=== Hon Solo says shoot first\n ===')
    t.end()
  })
})

test('b.render(name, context, callback) - nested partials', function(t) {
  var context = {
    title: 'Vanilla test render'
  }

  beardo({
    layout: 'default',
    basedir: basedir
  })
  .render('vanilla', context, function(err, output) {
    t.error(err, 'b.render(...) should not error')

    var $ = cheerio.load(output)
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
