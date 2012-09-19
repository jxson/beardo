# beardo

Provides an easy way to use mustache templates:

    var beardo = require('beardo')
      , beardopts = { directory: path.join(__dirname, './templates')
        , stamp: 'stamp-' + process.pid
        }

    http.createServer(function(req, res) {
      res.template = beardo.handler(req, res, beardopts)

      // Meanwhile
      return res.template('heyo', { headers: headers, layout: 'html' })
    })

It's still getting the bugs shaken out, more details and docs soon. Check out the tests for working examples.

# LICENSE (MIT)

Copyright (c) Jason Campbell ("Author")

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.