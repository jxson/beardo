[![build status](https://secure.travis-ci.org/jxson/beardo.png)](http://travis-ci.org/jxson/beardo)

# beardo

Provides an easy way to use layout aware mustache templates in your [node.js][node] projects. Add mustache files to a templates directory and use `beardo`'s methods to asynchronously read and render them as appropriate.

If you are using one of the http handlers (`beardo.middleware`, `beardo.handler`) [ETags][etags] get automatically added and 304 responses occur based on the `if-none-match` request header.

# beardo.handler(res, req, [options])

Adds a [Templar][templar] style response handler.

    var beardo = require('beardo')
      , beardopts = { directory: path.join(__dirname, './templates')
        , stamp: 'stamp-' + process.pid
        }

    http.createServer(function(req, res) {
      res.template = beardo.handler(req, res, beardopts)

      // Meanwhile
      res.template('heyo', { foo: 'bar, layout: 'html' })
    })

## Options

* `directory`: The directory that holds the mustache files
* `stamp`: Gets added to the response header as `x-beardo-stamp` to aid in debugging

# LICENSE (MIT)

Copyright (c) Jason Campbell ("Author")

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[node]: http://nodejs.org
[etags]: #
[templar]: #
