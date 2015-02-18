var test = require('tape')
var errno = require('errno')
var beardo = require('../')
var path = require('path')
var dir = path.resolve(__dirname, './templates')
var template = beardo(dir)

test('var template = beardo(options)', function(t) {
  t.equal(typeof beardo, 'function')
  t.equal(typeof beardo(dir), 'function')
  t.end()
})

test('template(name, callback)', function(t) {
  template('coffee-ipsum', function(err, output) {
    t.error(err, 'template(...) should not error')
    t.ok(output, 'should have output')
    t.ok(output.match('Coffee ipsum'), 'should render template output')
    t.end()
  })
})

test('template(name, context, callback)', function(t) {
  var context = {
    name: 'Chebacca',
    quote: 'RAWRRRR!'
  }

  template('quote', context, function(err, output) {
    t.error(err, 'template(...) should not error')
    t.ok(output, 'should have output')
    t.equal(output.trim(), 'Chebacca says RAWRRRR!')
    t.end()
  })
})

test('template(name, callback) - error: non-existing template', function(t) {
  const ENOENT = errno.code.ENOENT

  template('does-not-exist', function(err, output) {
    t.ok(err, 'template(...) should error')
    t.ok(err.message.match('does-not-exist'), 'should have a nice message')
    t.equal(err.errno, ENOENT.errno)
    t.equal(err.code, ENOENT.code)
    t.end()
  })
})

test('template(name, context, callback) - with a layout', function(t) {
  var context = {
    layout: 'text',
    name: 'Hon Solo',
    quote: 'shoot first'
  }

  template('quote', context, function(err, output) {
    t.error(err, 'template(...) should not error')
    t.ok(output, 'should have output')
    t.equal(output.trim(), '=== Hon Solo says shoot first\n ===')
    t.end()
  })
})
