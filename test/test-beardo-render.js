
var beardo = require('../')
  , assert = require('assert')
  , path = require('path')
  , directory = path.resolve(__dirname, './templates')

describe('beardo.render', function(){
  it('reads template', function(done){
    beardo(directory)
    .render('random-text.mustache', function(err, output){
      if (err) return done(err)
      assert.ok(output.match(/blah blah/))
      done()
    })
  })

  it('reads templates by normalized name', function(done){
    beardo(directory)
    .render('random-text', function(err, output){
      if (err) return done(err)
      assert.ok(output.match(/blah blah/))
      done()
    })
  })

  it('errs on non-existing templates', function(done){
    beardo(directory)
    .render('does-not-exist', function(err, template){
      assert.ok(err, 'Missing `error`')
      assert.equal(err.code, 'ENOENT', 'Bad `error.code`')
      assert.equal(template, undefined)
      done()
    })
  })
})
