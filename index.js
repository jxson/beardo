var path = require('path')
  , fs = require('fs')
  , glob = require('glob')
  , hogan = require('hogan')
  , sigmund = require('sigmund')
  , LRU = require('lru-cache')
  , cache = LRU({ max: 500 })
  , templates = {} // move or zap
  , methods
  , attributes

methods = {
  add: function(name, string){
    var beardo = this
      , template = hogan.compile(string)

    templates[name] = template

    // TODO: compiling and template object creation should be two separate
    // conearns
    return Object.create({
      render: function(context){
        var context = context || {}
          , template = this
          , layout = templates[path.join('layouts', context.layout)]
          , out = template.hulkamania.render(context, templates)

        context.yield = function(){
          return layout ? out : null
        }


        if (layout) return layout.render(context, templates)
        else return out
      }
    }, { hulkamania: { value: template } })
  },
  scan: function scan(string){
    var scan = hogan.scan(string)

    return scan.filter(function(node){
      return node.tag === '>'
    }).map(function(tag){
      return tag.n
    })
  },
  // rename this
  layouts: function layouts(callback){
    var beardo = this
      , gloptions = { cwd: beardo.directory }
      , collection = {}
      , done

    done = function done(layout){
      collection
      callback(null)
    }

    glob('layouts/**/*.mustache', gloptions, function(err, layouts){
      if (err) return callback(err)

      if (layouts.length) {
        layouts.forEach(function(layout){
          // console.log('layout:', layout)

          beardo.read(layout, function(err, tpl){
            if (err) return callback(err)

            collection[layout.replace('.mustache', '')] = tpl

            if (Object.keys(collection).length === layouts.length) {
              callback(null, collection)
            }
          })
        })
      } else {
        return callback(null, collection)
      }
    })
  },
  read: function read(name, callback){
    var beardo = this
      , name = name.replace('.mustache', '')
      , file = path.join(beardo.directory, name + '.mustache')

    // this could be pulled into a separate method
    fs.stat(file, function(err, stats){
      if (err) return callback(err)

      var key = sigmund([ stats.ino
          , stats.mtime
          , stats.size
          ])
        , cached = cache.get(key)

      // making this a method might make things simpler and easier to test, or
      // just more confusing...
      //
      //    if (beardo.cache(stats, callback)) return
      //

      if (cached) {
        // console.log('cached!')
        return callback(null, cached)
      }

      // console.log('not cached', name)

      fs.readFile(file, 'utf8', function(err, data){
        if (err) return callback(err)

        var template = beardo.add(name, data)
          , partials = beardo.scan(data)
          , counter = 0

        // console.log('partials', partials)

        if (! partials.length) return callback(null, template)

        partials.forEach(function(partial){
          beardo.read(partial, function(err){
            counter++

            if (counter === partials.length) callback(null, template)
          })
        })
      })
    })
  },
  handler: function handler(req, res, options){
    var options = options = {}
  }
}

attributes = {
  directory: { enumerable: true
  , writable: true
  , value: path.resolve('templates')
  }
}

module.exports = Object.create(methods, attributes)
