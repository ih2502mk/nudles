

var Container = function(options) {
  this.nested = [];
  this.name = options.name;
}

Container.prototype.render = function (cb) {
  var self = this,
  nesteds = self.nested.length,
  results = {},
  innerCb = function(err, results) {
    cb(err, self.template(results));
  }
  
  self.nested.forEach(function(el, index, array){
    el.render(function(err, str) {
      if (err) cb(err);
      
      nesteds -= 1;
      
      results[el.name] = str;
      
      if (nesteds === 0) {
        innerCb(err, results)
      }
    });
  });
  
}

Container.prototype.template = function (locals) {
  return "";
}

module.exports.Container = Container