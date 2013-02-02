
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
})
