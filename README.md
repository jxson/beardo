# beardo [![build status](https://secure.travis-ci.org/jxson/beardo.png)](http://travis-ci.org/jxson/beardo) [![Dependency Status](https://david-dm.org/jxson/beardo.png)](https://david-dm.org/jxson/beardo)

[![NPM](https://nodei.co/npm/beardo.png)](https://nodei.co/npm/beardo/)

> A mustache template utility for Node.js servers/ projects.

The best mustaches were beards first. This module provides simple, layout aware APIs for working with mustache templates. Add mustache files to a templates directory and use `beardo` to lazily and asynchronously read and render them as appropriate.

# Example: res.template() 

Decorate the http `res` obeject with a Templar compatible `res.template` method. Etags and 304 responses will get automatically handled.

    var beardo = require('beardo')
      , http = require('http')
      , path = require('path')
      , options = { directory: path.resolve(__dirname, './templates') }

    http.createServer(function(req, res){
      res.template = beardo(req, res, options)

      // Then later you can render `templates/heyo.mustache` with an optional context
      res.template('heyo', { foo: 'bar' })
    })

Templates by default will get wrapped in `templates/layouts/default.mustache`. If you want to change the layout add it to the context object as the second argument.

    res.template('heyo', { foo: 'bar', layout: 'custom-layout' })

Alternatively if you don't want a layout at all set it to `false`:

    res.template('heyo', { layout: false })


# Example: API usage

You can use beardo directly to render templates in other contexts or if you don't want to decorate the res object:

		beardo(directory)
    .render('my-template', { foo: 'bar' }, function(err, output){
      if (err) throw err 
			console.log(output)
    })

# API

		var beardo = require('beardo')

## res.template = beardo(req, res, options)

Decorate `res` with a template method for rendering mustache files templates in `options.directory`. This method will automatically handle Etags and 304 responses.

### res.template(templateName, [data], [statusCode])

* templateName: A string that is the name, relative to the `options.directory` of the mustache template. 
* data: the optional data object to pass to the templates. If you want to change the layout or not have one add the layout key to this object.
* statusCode: the optional http status code, defaults to 200

`res.template` will read all the necessary files (including layouts and partials) and by default will respond with the rendered output as `text/html` with a 200 ok. To render a different content-type set the header ahead of calling `res.template` for example:

		res.setHeader('content-type', 'text/plain')
		res.template('random-text')

Note: Since beardo only works with mustache, template names get normalized in a way that makes appending '.mustache' to them unnecessary. For example these two calls will  effectively be the same: `res.template('vanilla')`, `res.template('vanilla.mustache')`

## Standard beardo instance

		var b = beardo(options)

options:

* directory: The path to the directory where the templates reside. Defaults to `process.cwd + '/templates'`, you should explicitly set this.
* cache: Boolean which can toggle the behavior for how the underlying cacheing works. Set to `false` if you want the templates re-read on every request (ideal for development). By default this is set to `true` saving extra fs calls for templates that have been cached.read calls on subsequent requests.

## b.render(templateName, [data], callback)

Render a template in `options.directory`

* templateName: A string that is the name, relative to the `options.directory` of the mustache template. 
* data: the optional data object to pass to the templates. If you want to change the layout or not have one add the layout key to this object.
* callback: The function that will be called when the output from the template is rendered. Arguments for the call back are:
	* error: Error|null
	* output: A string of the rendered output of the template.

## b.add(name, content)

Allows you to dynamically add templates that `beardo` can then render, this is handy for instances where you might have template data in other places that are not the `options.directory`

* name: the name of the template being added
* content: A string of the template

    beardo(directory)
    .add('user', '<p>hello {{ name }}</p>')
    .render('user', { name: 'jxson' }, function(err, output){
      if (err) return done(err)
			console.log(output)	// '<p>hello jxson</p>
    })

## EXPERIMENTAL: b.bundle(callback)

Creates a pre-compiled bundle of all the templates that can be loaded into a script tag and used client-side.

* callback: A function that is called when the bundle is read and pre-compiled.
	* error: Error|null
	* output: A string of the pre-compiled templates which should be saved and then included in a client-side script tag.

### window.template(templateName, [data])

Once your bundle is ready and has been added to your client it will add a template function to the `window` that works similarly to the `res` decorator.

* templateName: A string that is the name, relative to the `options.directory` of the mustache template. 
* data: the optional data object to pass to the templates. Layouts are excluded from the bundle, if you think this should be changed let me know.

NOTE: I am still churning on this one, if you have comments or feedback please let me know. The bundle is something I hacked in a while ago and found it incredibly useful but I am sure it can be refined, I know the client-side implementation needs some work and could be made in a way that is compatible with other development flows. If you have any feedback regarding this don't hesitate to create an issue or get in touch.

# DEVELOPMENT

You can run the tests through standard npm commands.

		$ npm install # installe dependencies 
		$ npm test 		# run the tests

Currently there are no specific tests for the browser bundle, I approximate the environment in a standard test.

## CONTRIBUTING

Want to help? Send a pull request, I'll give you commit access and we can make this better.

If a PR is too much any feedback is  always welcome, I prefer GH issues but a tweet or IRC chat is totally fine as well :)

# LICENSE (MIT)

Copyright (c) Jason Campbell ("Author")

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
