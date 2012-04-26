var 
  containers = {}; // Collection of container objects

var Container = function(options) {
  this.nested = [];
  this.name = options.name; // better be unique or namespaced but instace of String
  this.tplPlaceholder = options.tplPlaceholder || ("placeHolder_" + options.name);
  this.tplString = options.tplString || ("<span>{" + this.tplPlaceholder + "}</span>");
  containers[this.name] = this;
}

Container.prototype.render = function (cb) {
  var self = this,
  nesteds = self.nested.length,
  results = {},
  innerCb = function(err, results) {
    cb(err, self.template(results));
  }
  
  self.nested.forEach(function(el){
    containers[el].render(function(err, str) {
      if (err) {
        cb(err);
        innerCb = function(){};
      }
      
      nesteds -= 1;
      
      results[el.tplPlaceholder] = str;
      
      if (nesteds === 0) {
        innerCb(err, results)
      }
    });
  });
  
}

Container.prototype.template = function (locals) {
  // apply locals to this.tplString
  return "";
}

module.exports.Container = Container