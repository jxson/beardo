var Beardo = require('./beardo')

module.exports = create
module.exports.ctor = Beardo

// # create(options)
//
// Exported function for creating a single method for rendering templates in
// `options.basedir`.
//
//    var beardo = require('beardo')
//    var template = beardo(options)
//
// The returned function is a bound Beardo instance .render() method. This
// allows simple usage for template rendering that has been scoped to a singe
// Beardo instance, the returned template function has access to the
// instances internal caches and methods.
//
//    var context = { foo: 'bar' }
//
//    template('foo', context, function(err, output) {
//      if (err) throw err
//      console.log('output', output)
//    })
//
function create(options) {
  var beardo = new Beardo(options)
  var fn = beardo.render.bind(beardo)

  return fn
}
