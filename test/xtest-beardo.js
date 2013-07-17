
var beardo = require('../')
  , path = require('path')
  , assert = require('assert')

describe('beardo.directory', function(){
  it('exists', function(){
    assert.ok(beardo.directory)
  })

  it('is writeable', function(){
    beardo.directory = path.join(__dirname, './templates')

    assert.equal(beardo.directory, path.join(__dirname, './templates'))
  })
})

describe('beardo.templates', function(){
  it('exists', function(){
    assert.ok(beardo.directory)
  })

  it('is writeable', function(){
    beardo.directory = path.join(__dirname, './random/dir')

    assert.equal(beardo.directory, path.join(__dirname, './random/dir'))
  })
})

describe('beardo.cache', function(){
  it('exists', function(){
    assert.ok(beardo.cache)
  })

  it('is writeable', function(){
    beardo.cache = false

    assert.equal(beardo.cache, false)

    beardo.cache = true

    assert.equal(beardo.cache, true)
  })
})
