
var beardo = require('../')
  , path = require('path')
  , assert = require('assert')

describe('beardo.read', function(){
  before(function(){
    beardo.directory = path.join(__dirname, './templates')
  })

  it('reads templates', function(done){
    beardo.read('basic', function(err, template){
      if (err) return done(err)

      assert.ok(template)
      assert.equal(template.render({ text: 'foo' }), 'basic tom fooery')

      done()
    })
  })

  it('errs on non-existing templates', function(done){
    beardo.read('bogus', function(err, template){
      assert.ok(err, 'Missing `error`')
      assert.equal(err.code, 'ENOENT', 'Bad `error.code`')
      assert.equal(template, undefined)

      done()
    })
  })
})
