var test = require('tape')
var beardo = require('../').ctor

test('b.set(key, value)', function(t) {
  beardo()
  .set('test', 'Follow @{{ username }}')
  .render({ username: 'jxson' }, function(err, output) {
    t.error(err, 'b.render(...) after b.set(...) should not error')
    t.equal(output, 'Follow @jxson')
    t.end()
  })
})
