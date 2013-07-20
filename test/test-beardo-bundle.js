
var beardo = require('../')
  , assert = require('assert')
  , path = require('path')
  , directory = path.resolve(__dirname, './templates')

describe('beardo(options).bundle(callback)', function(){
  var bundle

  before(function(done){
    beardo(directory)
    .bundle(function(err, src){
      bundle = src
      done(err)
    })
  })

  it('creates a bundle for the browser', function(){
    assert.ok(bundle, 'Missing bundled source')
    assert.doesNotThrow(function(){
      eval(bundle)
    }, 'Bundle will error in browser')
  })

  describe('window.render(name, context)', function(){
    var window = {}

    before(function(){
      eval(bundle) // simulating a script tag
      window.template = template
    })

    it('renders templates', function(){
      var output = window.template('vanilla')
        , cheerio = require('cheerio')
        , $ = cheerio.load(output)

      assert.equal($('#default-layout'), 0, 'Should not render layouts')
      assert.ok($('h1').text().match(/Vanilla/)
      , 'Should render vanilla.mustache')
      assert.ok($('p').length >= 2, 'Should render partials')
      assert.ok($('p').length >= 3, 'Should render nested partials')
    })

    it('barfs on missing templates', function(){
      assert.throws(function(){
        window.template('should-throw')
      })
    })
  })
})
