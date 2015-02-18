var test = require('tape')
var beardo = require('../').ctor
var path = require('path')
var basedir = path.resolve(__dirname, './templates')

test('b.get(key, value)', function(t) {
  beardo(basedir)
  .get('quote', function(err, template) {
    t.error(err, 'b.get(...) should not error')

    var contex = { name: 'jxson', quote: 'meh' }
    var output = template.render(contex).trim()

    t.equal(output, 'jxson says meh')
    t.end()
  })
})
