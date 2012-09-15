
var beardo = require('../')
  , path = require('path')
  , assert = require('assert')

describe('beardo', function(){
  it('require returns a beardo instance', function(){
    assert.ok(beardo, 'beardo is undefined. WTF?')
    assert.ok(beardo.directory, 'Missing `directory` property')
    assert.equal(typeof beardo.read, 'function', 'Missing `read` method')
  })
})

describe('beardo.directory', function(){
  it('defaults to `process.cwd()`', function(){
    assert.equal(beardo.directory, path.resolve('templates'))
  })

  it('is writeable', function(){
    beardo.directory = path.join(__dirname, './templates')

    assert.equal(beardo.directory, path.join(__dirname, './templates'))
  })
})

describe('beardo.read', function(){
  before(function(){
    beardo.directory = path.join(__dirname, './templates')
  })

  it('reads templates', function(done){
    beardo.read('basic', function(err, template){
      if (err) return done(err)

      assert.ok(template, 'Missing `template` argument')
      assert.equal(template.render({ text: 'foo' }), 'basic tom fooery')

      done()
    })
  })

  it('reads templates with partials', function(done){
    beardo.read('has-partial', function(err, template){
      if (err) return done(err)

      assert.ok(template, 'Missing `template` argument')
      assert.equal(template.render(), 'partial! w007')

      done()
    })
  })

  it('reads templates with nested partials', function(done){
    beardo.read('has-nested-partials', function(err, tpl){
      if (err) return done(err)

      assert.ok(tpl, 'Missing `template` argument')
      assert.equal(tpl.render(), 'A dream, within a dream, within a dream')

      done()
    })
  })

  it('errs on non-existing templates', function(done){
    beardo.read('bogus', function(err, template){
      assert.ok(err, 'Missing `error`')
      assert.equal(err.code, 'ENOENT', 'Bad `error.code`')
      assert.equal(template, undefined, '`template` should be `undefined`')

      done()
    })
  })
})

describe('beardo.layouts', function(){
  before(function(){
    beardo.directory = path.join(__dirname, './templates')
  })

  it('reads the layouts dir', function(done){
    beardo.layouts(function(err, layouts){
      if (err) return done(err)

      assert.ok(layouts)
      assert.ok(layouts['layouts/default'])
      assert.equal(layouts['layouts/default'].render(), '===  ===')

      done()
    })
  })

  it('allows templates with layouts', function(){
    beardo.layouts(function(err, layouts){
      if (err) return done(err)

      beardo.read('needs-layout', function(err, tpl){
        if (err) return done(err)

        assert.ok(tpl, 'Missing `template` argument')
        assert.equal(tpl.render({ layout: 'default' }), '=== gimme danger ===')

        done()
      })
    })
  })
})

describe('beard.handler', function(){
  before(function(){
    beardo.directory = path.join(__dirname, './templates')
  })

  it('exists', function(){
    assert.equal(typeof beardo.handler, 'function', 'Missing `handle` method')
  })

  describe('responding with templates', function(){
    it('responds with rendered content')
    // * 200
    // * etag
    // * content-type === 'text/html'
    // * date
    // * connection === 'keep-alive'
    // * transfer-encoding === 'chunked'
    // * rendered body

    it('responds to cache requests')
    // * 304
    // * no body

    it('responds to cache requests with changed content')
    // * 200
    // * has e-tag
    // * content-type === 'text/html'
    // * date
    // * connection === 'keep-alive'
    // * transfer-encoding === 'chunked'
    // * rendered body

    it('does NOT override headers')
    // * 200
    // * has e-tag
    // * content-type === 'text/plain'
    // * date
    // * connection === 'keep-alive'
    // * transfer-encoding === 'chunked'
    // * rendered body
  })

  describe('responding with non-exisiting template', function(){
    it('responds with not-found page')
    // * 400
    // * has e-tag
    // * content-type === 'text/plain'
    // * date
    // * connection === 'keep-alive'
    // * transfer-encoding === 'chunked'
    // * rendered body
  })
})
