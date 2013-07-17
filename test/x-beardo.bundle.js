// Bundles the mustache templates into a contcatendated and minified file for
// easy usage in the browser
//
//   beardo.bundle(opts, function(err, data){
//     fs.writeFile('templates.js', 'utf8', data)
//   })
//
//   in the browser
//
//     template('heyo', { what: 'ever' })
