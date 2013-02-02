var benchmark = require('benchmark')
  , suite = new benchmark.Suite('beardo')
  , beardo = require('../index')
  , path = require('path')

beardo.directory = path.join(__dirname, '..', 'test', 'templates')

// add tests
suite.add('beardo.read() // caching off', function(deferred) {
  beardo.cache = false

  beardo.read('heyo', function(err, template){
    if (err) throw err

    deferred.resolve()
  })
}, { defer: true })
suite.add('beardo.read() // caching on', function(deferred) {
  beardo.cache = true

  beardo.read('heyo', function(err, template){
    if (err) throw err

    deferred.resolve()
  })
}, { defer: true })
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run({ 'async': true });