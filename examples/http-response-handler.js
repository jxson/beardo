var http = require('http')
  , path = require('path')
  , beardo = require('../')
  , beardopts = { directory: path.resolve(__dirname, './templates') }
  , server

server = http.createServer(function(req, res) {
  res.template = beardo.handler(req, res, beardopts)

  switch (req.url) {
    case '/':
      var context = { title: 'Basic template with a layout'
          , layout: 'default'
          }

      return res.template('index', context)

    case '/text':
      res.setHeader('content-type', 'text/plain')

      return res.template('plain-text', { text: 'foo' })

    default:
      return res.template('404', 404)
  }
})

server.listen(1337)
