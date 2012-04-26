var 
  containers = {}; // Collection of container objects

var Container = function(options) {
  this.nested = options.nested || [];
  this.name = options.name; // better be unique or namespaced but instace of String
  this.tplPlaceholder = options.tplPlaceholder || ("placeHolder_" + options.name);
  this.tplString = options.tplString || ("<span>{" + this.tplPlaceholder + "}</span>");
  this.filler = options.filler || "nothing";
  containers[this.name] = this;
}

Container.prototype.render = function (cb) {
  var self = this,
  nesteds = self.nested.length,
  results = {},
  innerCb = function(err, results) {
    cb(err, self.template(results));
  }
  
  if (self.nested.length) { 
    self.nested.forEach(function(nested_name){
      containers[nested_name].render(function(err, str) {
        if (err) {
          cb(err);
          innerCb = function(){};
        }

        nesteds -= 1;

        results[containers[nested_name].tplPlaceholder] = str;

        if (nesteds === 0) {
          innerCb(err, results)
        }
      });
    });
  }
  else if (typeof self.filler === 'function') {
    self.filler(function(err, result) {
      if(err) {
        cb(err);
      }
      else {
        var normalResult = {};
        normalResult[self.tplPlaceholder] = result;
        cb(null, normalResult);
      }
    })
  }
  else if (typeof self.filler === 'string') {
    var normalResult = {};
    normalResult[self.tplPlaceholder] = self.filler;
    cb(null, normalResult);
  }
  
}

Container.prototype.template = function (locals) {
  // apply locals to this.tplString
  // need a way to include template engine semewhere here
  var self = this,
  ret = {};
  ret[self.tplPlaceholder] = locals;
  return ret;
}

module.exports.Container = Container