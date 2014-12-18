# beardo

[![NPM](https://nodei.co/npm/beardo.png)](https://nodei.co/npm/beardo/)

> A mustache template utility for Node.js servers/ projects.

[![build status](https://secure.travis-ci.org/jxson/beardo.png)](http://travis-ci.org/jxson/beardo) [![Dependency Status](https://david-dm.org/jxson/beardo.png)](https://david-dm.org/jxson/beardo)

The best mustaches were beards first. The `beardo` module provides simple, layout aware APIs for working with [mustache templates][mustache]. Add your template files to a directory and use `beardo` to lazily and asynchronously read and render them as appropriate.

# Example: res.template()

{{{ layout-content }}}

Decorate the http `res` object with a [Templar][templar] compatible `res.template` method. [Etags][etag] and 304 responses will be automatically handled.

    var beardo = require('beardo')
      , http = require('http')
      , path = require('path')
      , options = { directory: path.resolve(__dirname, './templates') }

    http.createServer(function(req, res){
      res.template = beardo(req, res, options)

      // Meanwhile you can render `templates/heyo.mustache` with an optional
      // context object.
      res.template('heyo', { foo: 'bar' })
    })


# Example: API usage

You can use `beardo` directly to render templates in other contexts or if you don't want to decorate the res object:

    beardo(directory)
    .render('my-template', { foo: 'bar' }, function(err, output){
      if (err) throw err
      console.log(output)
    })

# Directory Structure

The directory that holds all the templates can be named whatever you want but at a minimum should contain a layouts subdirectory with a default.mustache file:

    .
    └─ templates
        └─ layouts
            └─ default.mustache

Layouts need to use the `yield` helper to render their contents properly. Additional templates can be added anywhere in the templates directory (even subdirectories) and can be refferenced as paritals from other templates by thier names (relative to the templates directory). See the [examples for some guidance][examples].

# API

    var beardo = require('beardo')

## res.template = beardo(req, res, options)

Decorate `res` with a template method for rendering mustache files templates in `options.directory`. This method will automatically handle [Etags][etag] and 304 responses.


    var beardo = require('beardo')
      , http = require('http')
      , path = require('path')
      , options = { directory: path.resolve(__dirname, './templates') }

    http.createServer(function(req, res){
      res.template = beardo(req, res, options)

      // ...
    })

### res.template(name, [context], [statusCode])

* `name`: The template name/location relative to the `options.directory`
    * Type: `String`
* `context`: the optional context object to pass to the templates. If you want to change or ignore layouts this is the place to do it.
    * Type: `Object`
    * Default: `{ layout: 'default' }`
* `statusCode`: the optional http status code
    * Type: `Number`
    * Default: 200 or 304 if there is a matching if-none-match header for the previous response's Etag headers.

Reads and renders all the necessary files (including layouts and partials) and by default will respond with the rendered output as `text/html` with a 200 ok.

    res.template('heyo', { foo: 'bar' })

To respond with a different `content-type` set the header before calling `res.template`:

    res.setHeader('content-type', 'text/plain')
    res.template('my-plain-text-template')

Templates by default will be wrapped in `templates/layouts/default.mustache`. If you want to change the layout add it to the context object.

    res.template('heyo', { foo: 'bar', layout: 'custom-layout' })

Alternatively if you don't want a layout at all set it to `false`:

    res.template('heyo', { layout: false })

Note: Since beardo only works with mustache, template names get normalized in a way that makes appending '.mustache' to them unnecessary. For example these two calls will  effectively be the same: `res.template('vanilla')`, `res.template('vanilla.mustache')`

## Standard beardo instance

    var b = beardo(options)

### Options

* `directory`: The path to the directory where the templates reside. Even though there is a default you should explicitly set this value.
    * Type: `path`
    * Default: `process.cwd + '/templates'`
* `cache`: Toggles the cacheing. Set to `false` if you want the templates re-read on every call to `b.render()` (ideal for development). By default this is set to `true` saving extra fs calls and template compilation for previously rendered templates.
    * Type: `Boolean`
    * Default: `true`

## b.render(name, [context], callback)

* `name`: The name/location relative to the `options.directory` of the template to render.
    * Type: `String`
* `context`: the optional context object to pass to the templates. If you want to change or ignore layouts this is the place to do it.
    * Type: `Object`
    * Default: `{ layout: 'default' }`
* `callback`: The function that will be called when the output from the template is rendered.
    * Type: `Function`
    * Arguments: `(err, output)`, where output is the rendered contents of the template.

Asynchronously render a template in `options.directory`.

    beardo(directory)
    .render('my-template', { foo: 'bar' }, function(err, output){
      if (err) throw err
      console.log(output)
    })

## b.add(name, content)

* `name`: the name of the template being added
    * Type: `String`
* `content`: The content of the template
    * Type: `String`

Allows you to dynamically add templates that `beardo` can then render, this is handy for instances where you might have template data in other places that are not the `options.directory`

    beardo(directory)
    .add('user', '<p>hello {{ name }}</p>')
    .render('user', { name: 'jxson' }, function(err, output){
      if (err) return done(err)
      console.log(output) // '<p>hello jxson</p>
    })

## b.bundle(callback)

> Stability: 1 - Experimental

* `callback`: A function that is called when the bundle is ready.
    * Type: `Function`
    * Arguments: `(err, data)` , where data is a string of JavaScript that is the pre-compiled templates and a function for rendering them.

Asynchronously reads and pre-compiles all templates into a bundle of JS that can be loaded into a script tag and used client-side.

    beardo(directory)
    .bundle(function(err, data){
      if (err) throw err

      // Once the bundle is created you can drop it into a file (or respond
      // to an http request with it's content)
      var fs = require('fs')

      fs.writeFile('templates.js', data, function (err) {
        if (err) throw err
        console.log('template bundle saved!')
      })
    })

### window.template(name, [context])

* `name`: The name of the template relative to the `options.directory`.
    * Type: `String`
* `context`: An optional context object to pass to the templates. Layouts are excluded from the bundle, if you think this should be changed please [create an issue][issues] with details on your use case.
    * Type: `Object`
    * Default: `{}`

Once the template bundle is loaded into the client you can use `window.template(...)` to render templates in your client-side JS.

    var rendered = window.template('hiya', { name: 'jxson' })

    console.log(rendered)


NOTE: The bundle is something I hacked in a while ago and found it incredibly useful. I am still churning on it and the client-side API though, if you have comments or feedback [please let me know][issues].

# DEVELOPMENT

You can run the tests through standard npm commands.

    $ npm install   # install dependencies
    $ npm test      # run the tests

Currently there are no specific tests for the browser bundle, I approximate the environment in a standard test.

# CONTRIBUTING

Want to help? Send a [pull request][pr], I'll give you commit access and we can make this better.

If a PR is too much any feedback is always welcome, I prefer [GH issues][issues] but a [tweet][twitter] or IRC chat is totally fine as well :)

# LICENSE (MIT)

Copyright (c) Jason Campbell ("Author")

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[mustache]: http://mustache.github.io
[templar]: http://npmjs.org/package/templar
[etag]: http://en.wikipedia.org/wiki/HTTP_ETag
[examples]: https://github.com/jxson/beardo/tree/master/examples
[issues]: https://github.com/jxson/beardo/issues
[pr]: https://github.com/jxson/beardo/pulls
[twitter]: https://twitter.com/jxson
