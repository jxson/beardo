# beardo

A layout aware utility for working with [mustache templates][mustache].

[![build][travis-badge]][travis-link] [![coverage][coverage-badge]][coverage-link] [![dependencies][dependency-badge]][dependency-link]

Add files to a configurable templates directory and then use the `beardo` module to lazily and asynchronously render them. Rendered output will include transitive partials and layouts automatically.

Related modules:

* beardo-http: create a template helper for responding to http requests.

# Example

To render a mustache template (including any partials) you can use a string name of the template relative to a templates directory (with or without the `.mustache` extension).

    var beardo = require('../')
    var dir = './templates'
    var template = beardo(dir)
    var context = { username: 'jxson' }

    template('user', context, function(err, output) {
      if (err) throw err
      console.log(output)
    })

The directory that holds all the templates is entirely configurable. If you nest directories those individual templates can be referenced with a relative name. See the [example] for reference usage.

## Layouts

Layout support is built in by default, setting `context.layout` will wrap the layout around the template's output.

    var context = {
      layout: 'special',
      username: 'jxson'
    }

    template('user', context, function(err, output) {
      if (err) throw err
      console.log(output)
    })

### Default layout

It would be annoying to have to set the layout every time `template(...)` is called so it can be configured via `options.layout` when creating the template function.

    var beardo = require('beardo')
    var template = beardo({
      dirname: './templates',
      layout: 'default'
    })
    var context = { username: 'jxson' }

    template('user', context, function(err, output) {
      if (err) throw err
      console.log(output)
    })

### Layout templates

Any layout templates are expected to live in a `layouts` subdirectory and will have the special template variable `{{{ layout-content }}}`. If you are rendering HTML be sure to user the triple mustaches to prevent escaping.


## Directory Structure

Templates can be added anywhere in the templates directory (even subdirectories) and can be referenced as partials from other templates by their names (relative to the templates directory). See the [examples for some guidance][example].

# API

    var beardo = require('beardo')

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
[example]: https://github.com/jxson/beardo/tree/master/examples
[issues]: https://github.com/jxson/beardo/issues
[pr]: https://github.com/jxson/beardo/pulls
[twitter]: https://twitter.com/jxson
[travis-badge]: https://secure.travis-ci.org/jxson/beardo.png
[travis-link]: http://travis-ci.org/jxson/beardo
[coverage-badge]: https://coveralls.io/repos/jxson/beardo/badge.svg?branch=
[coverage-link]: https://coveralls.io/r/jxson/beardo?branch=
[dependency-badge]: https://david-dm.org/jxson/beardo.png
[dependency-link]: https://david-dm.org/jxson/beardo
