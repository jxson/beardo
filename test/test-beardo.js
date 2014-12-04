
var test = require('tape')
var beardo = require('../')
var path = require('path')
var dir = path.resolve(__dirname, './templates')

test('beardo()', function(t) {
  t.equal(typeof beardo, 'function')
  t.ok(beardo(dir) instanceof beardo, 'should not require "new"')
  t.end()
})

test('b.set(key, value)', function(t) {
  beardo(dir)
  .set('test', 'Follow @{{ username }}')
  .render({ username: 'jxson' }, function(err, output) {
    t.error(err)
    t.equal(output, 'Follow @jxson')
    t.end()
  })
})
