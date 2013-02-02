var path = require('path')
  , fs = require('graceful-fs')
  , crypto = require('crypto')
  , hogan = require('hogan.js')
  , glob = require('glob')
  , LRU = require('lru-cache')
  , readCache = LRU({ max: 500
    // maxAge 30 mins
    , maxAge: 1000 * 60 * 30
    , length: function(n){
        console.log('n', n)

        return 1
      }
    })
  // , compileCache =

var attributes = { directory: { enumerable: true
  , writable: true
  , value: path.resolve('templates')
  }
, templates: { value: {} }
, cache: { value: true }
}

module.exports = Object.create({ read: read
, render: render
, handler: handler
, add: add
}, attributes)

function add(name, string){
  var beardo = this
    , template = hogan.compile(string)

  template.name = name

  beardo.templates[name] = template

  return beardo.templates[name]
}

function render(name, context, callback){
  var beardo = this
    , context = context || {}
    , useLayout = context.layout === false ? false : true
    , layoutName = path.join('layouts', context.layout || 'default')
    , queue = []

  if (useLayout) {
    queue.push(layoutName)
    beardo.read(layoutName, done)
  }

  queue.push(name)

  beardo.read(name, done)

  function done(err, template){
    if (err) return callback(err)

    queue.splice(queue.indexOf(template.name), 1)

    if (queue.length === 0) {
      var layout = beardo.templates[layoutName]
        , template = beardo.templates[name]
        , output = template.render(context, beardo.templates)


      context.yield = function(){
        return useLayout ? output : null
      }

      if (useLayout) callback(null, layout.render(context, beardo.templates))
      else callback(null, template.render(context))
    }
  }
}

function read(name, callback){
  var beardo = this
    , name = name.replace('.mustache', '')
    , file = path.join(beardo.directory, name + '.mustache')

  fs.stat(file, function(err, stats){
    if (err) return callback(err)

    if (beardo.cache) {
      var key = hashStats(stats)
        , cached = readCache.get(key)

      if (cached) return callback(null, cached)
    }

    fs.readFile(file, 'utf8', function(err, data){
      if (err) return callback(err)

      var template = beardo.add(name, data)
        , partials = scan(data)
        , queue = []

      if (partials.length === 0) return callback(null, template)

      partials.forEach(function(partial){
        queue.push(partial)

        beardo.read(partial, function(err){
          if (err) return callback(err)

          queue.splice(queue.indexOf(partial), 1)

          if (queue.length === 0) {
            if (beardo.cache) readCache.set(key, template)

            callback(null, template)
          }
        })
      })
    })
  })
}


function handler(req, res, opts){
  var beardo = this
    , opts = opts || {}
    , stamp = opts.stamp

  if (opts.directory) beardo.directory = opts.directory
  if (opts.dir) beardo.directory = opts.dir

  beardo.cache = opts.cache || false

  template.has = function(name){
    var name = name.match('.mustache') ? name : name + '.mustache'
      , tpls

    tpls = glob.sync('**/*.mustache', { cwd: beardo.directory })

    return tpls.indexOf(name) > -1
  }

  return template

  function template(name, context, code){
    if (typeof context === 'number') {
      code = context
      context = {}
    }

    beardo.render(name, context, function(err, output){
      var etag = hash(output)


      if (req.headers['if-none-match'] === etag) {
        res.statusCode = 304
        res.end()
        return
      }

      // Only set after 304 resp
      res.setHeader('etag', etag)
      if (stamp) res.setHeader('x-beardo-stamp', stamp)


      // Don't override content-type header
      if (! res.getHeader('content-type')) {
        res.setHeader('content-type', 'text/html')
      }

      res.statusCode = code || 200
      res.end(output)
    })
  }
}

function scan(string){
  return hogan.scan(string).filter(function(node){
    return node.tag === '>'
  }).map(function(tag){
    return tag.n
  })
}

function hash(string){
  return crypto
  .createHash('md5')
  .update(string)
  .digest('base64')
}

function hashStats(stats){
  return hash([stats.ino
  , stats.mtime
  , stats.size
  ].join(''))
}
