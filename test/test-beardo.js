
var test = require('tape')
var Beardo = require('../').ctor

test('var Beardo = require("beardo").ctor', function(t) {
  t.equal(typeof Beardo, 'function')

  var b = new Beardo()

  t.ok(b instanceof Beardo, 'should be instanceof Beardo')
  t.ok(Beardo() instanceof Beardo, 'should not require "new"')
  t.end()
})
