
var hogan = require('hogan.js')

module.exports = Template

function Template(key, string) {
  if (!(this instanceof Template))
    return new Template(key, string)

  var template = this

  template.key = key
  template._template = hogan.compile(string)
  template.partials = hogan.scan(string).filter(isPartial).map(name)
}

Template.prototype.render = function(context, partials) {
  var template = this
  var raw = {}

  // since partials are wrapped in this Template object
  for (var key in partials) {
    raw[key] = partials[key]._template
  }

  return template._template.render(context, raw)
}

function isPartial(node) {
  return node.tag === '>'
}

function name(tag) {
  return tag.n
}
