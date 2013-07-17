
var beardo = require('../')
  , assert = require('assert')
  , request = require('supertest')

describe('res.tempate = beardo(req, res, options)', function(){
  it('successfully renders content')

  it('does not override pre-existing headers')

  it('optionally sets res.statusCode')

  describe('cache headers and responses', function(){
    it('hanldes if-none-match request headers')

    it('does NOT 304 changed content')
  })
})
