
var test = require('tape')
var beardo = require('../')
var path = require('path')
var dir = path.resolve(__dirname, './templates')
var errno = require('errno')
var cheerio = require('cheerio')

test('beardo()', function(t) {
  t.equal(typeof beardo, 'function')
  t.ok(beardo(dir) instanceof beardo, 'should not require "new"')
  t.end()
})

test('b.set(key, value)', function(t) {
  beardo({
    basedir: dir,
    layout: false
  })
  .set('test', 'Follow @{{ username }}')
  .render({ username: 'jxson' }, function(err, output) {
    t.error(err)
    t.equal(output, 'Follow @jxson')
    t.end()
  })
})

test('b.get(key, value)', function(t) {
  beardo({
    basedir: dir,
    layout: false
  })
  .set('test', 'Follow @{{ username }}')
  .get(function(err, template) {
    t.error(err)
    t.equal(template.render({ username: 'jxson' }), 'Follow @jxson')
    t.end()
  })
})

test('b.render(name, callback)', function(t) {
  beardo({
    basedir: dir,
    layout: false
  })
  .render('random-text.mustache', function(err, output) {
    t.error(err)
    t.equal(output, 'Rawr rawr \n')
    t.end()
  })
})

test('b.render(name, callback)', function(t) {
  beardo({
    basedir: dir,
    layout: false
  })
  .render('random-text', function(err, output) {
    t.error(err)
    t.equal(output, 'Rawr rawr \n')
    t.end()
  })
})

test('error: non-existing template', function(t) {
  const ENOENT = errno.code.ENOENT

  beardo(dir)
  .render('does-not-exist', function(err, output) {
    t.ok(err, 'should error')
    t.ok(err.message.match('does-not-exist'), 'should have a nice message')
    t.equal(err.errno, ENOENT.errno)
    t.equal(err.code, ENOENT.code)
    t.end()
  })
})

test('b.render(name, callback) - layout', function(t) {
  var context = {
    title: 'Vanilla test render'
  }

  beardo(dir)
  .render('vanilla', context, function(err, output) {
    t.error(err, 'should not error')

    var $ = cheerio.load(output)
    var layout = $('body').data('layout')

    t.equal(layout, 'default', 'should be wrapped in default layout')
    t.ok($('header').length, 'layout should include header partial')
    t.ok($('footer').length, 'layout should include footer partial')
    t.equal($('h1').text(), context.title, 'should pass context to template')
    t.ok($('.vanilla').length, 'should render template')
    t.ok($('.more-vanilla').length, 'should render partials')
    t.ok($('.even-more-vanilla').length, 'should render nested partials')
    t.end()
  })
})
