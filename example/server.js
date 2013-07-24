var beardo = require('../')
  , http = require('http')
  , path = require('path')
  , options = { directory: path.resolve(__dirname, './templates') }
  , EP = require('error-page')

http.createServer(function(req, res){
  res.template = beardo(req, res, options)
  res.error = EP(req, res, { 404: 'errors/404'
  , '*': error
  })

  switch (req.url) {
    case '/':
      res.template('index', { name: 'World' })
      break
    case '/users/chewbacca':
      var user = { name: 'Chewbacca' }
      res.template('users/profile', { user: user })
      break
    case '/plain-text':
      res.setHeader('content-type', 'text/plain')
      res.template('random-text', { layout: false })
      break
    case '/teapot':
      res.template('errors/418', 418)
      break
    case '/fancy-page':
      res.template('pages/fancy', { layout: 'custom' })
      break
    case '/templates.js':
      beardo(options)
      .bundle(function(err, src){
        if (err) return res.error(err)
        res.end(src)
      })
      break
    default:
      res.error(404)
  }
}).listen(1337)

function error(req, res, data) {
  // IRL this should do way more.
  res.statusCode = data.statusCode || 500
  res.setHeader('content-type', 'text/plain')
  res.write(data.message)
  res.end()

  throw data.error
}
