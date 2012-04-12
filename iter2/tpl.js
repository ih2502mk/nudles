var _ = require('underscore')
  ,fs = require('fs');
  
var createTplCompiler = function (path) {
  var template = _.template(loadTpl(path));
  return function (locals) {
    return template(locals);
  };
}

var loadTpl = function(rel_path) {
  return fs.readFileSync(__dirname + '/' + rel_path , 'utf8');
}

exports.tplcpl = createTplCompiler;