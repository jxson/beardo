# beardo [![build status](https://secure.travis-ci.org/jxson/beardo.png)](http://travis-ci.org/jxson/beardo) [![NPM version](https://badge.fury.io/js/beardo.png)](http://badge.fury.io/js/beardo) [![Dependency Status](https://david-dm.org/jxson/beardo.png)](https://david-dm.org/jxson/beardo)

> A mustache template utility for Node.js servers/ projects.

The best mustaches were beards first. This module provides simple, layout aware APIs for working with mustache templates. Add mustache files to a templates directory and use `beardo` to lazily and asynchronosly read and render them as appropriate.

# EXAMPLES

Decorate the http `res` obejct with a Templar compatible `res.template` method. Etags and 304 responses are automatically handled.

    var beardo = require('beardo')
      , http = require('http')
      , path = require('path')
      , options = { directory: path.resolve(__dirname, './templates') }

    http.createServer(function(req, res){
      res.template = beardo(req, res, options)

      // Then later you can render `templates/heyo.mustache` with
      res.tempalte('heyo')
    })

Templates by default will get wrapped in `templates/layouts/default.mustache`. If you want to change the layout add it to the context object as the second argument.

    res.template('heyo', { foo: 'bar', layout: 'custom-layout' })

Alternatively if you dont want a layout at all set it to `false`:

    res.template('heyo', { layout: false })


    beardo(directory)
    .render('random-text', function(err, output){
      if (err) return done(err)
      assert.ok(output.match(/blah blah/))
      done()
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





README

Blockquote project summary


Brightens your day by opening a browser tab to a music video


When showing up to a project, potential users want to quickly determine what it offers them. Using a markdown blockquote at the top of your README is a clear way to display a summary of your project to a new user.

Minimal Usage

Once you've convinced the user to try out your project, it is valuable to give them instructions of how to use it with minimal configuration. Later in your documentation you can embellish in more extensive examples, but it is important to get a new user started quickly so that they get invested in the project.

Explicity define the API

Users don't want to look at your source code to learn how to use your project. By explicitly defining parameter types, descriptions, and default values(if any) of your methods parameters/properties, you can save yourself time responding to issues submitted by confused users. I like to use the same syntax as the node.js docs when defining methods, here is an example method definition for mymodule:

mymodule(inputString, [color], [callback])
When defining parameters, I like to first define its type, then any default values, then describe it. Sometimes the parameter warrants an example use case to illustrate its usage relative to other parameters. Here are example parameter definitions for mymodule:

inputString
Type: String

Description of the inputString parameter.

color
Type: String Default: 'blue'

Description of the color parameter.

callback
Type: Function

Description of the callback parameter. This parameter can be used as the second parameter if the color is omitted. Here is an example which illustrates this usage:

mymodule('Hello World!', function () {
  console.log('I am in a callback :)');
});


Issue Driven Development

Issues are the most transparent way to keep track of a project's development. They are a great place to solicit feedback from contributors and users before implementing new features, as well as a place to track to-dos. Having issues on a project that suggest future development invites new contributors to get involved and resolve those issues.

