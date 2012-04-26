var 
  containers = {}; // Collection of container objects
  
/**
 * Construct a container object
 * @param options String object which defines contents and behavior of container
 *    - options.name - name, should be unique 
 *    - options.nested - array of names of nested containers
 *    - options.tplPlaceholder - result of rendering will be passed to template 
 *    keyd with this value
 *    - options.tplString - template string
 *    - options.filler - function that gets content if there is no nested items, 
 *    or a string that is content
 */
var Container = function(options) {
  this.nested = options.nested || [];
  this.name = options.name; // better be unique or namespaced but instace of String
  this.tplPlaceholder = options.tplPlaceholder || ("placeHolder_" + options.name);
  this.tplString = options.tplString || ("<span>{" + this.tplPlaceholder + "}</span>");
  this.filler = options.filler || "nothing";
  containers[this.name] = this;
}

/**
 * Iteratively render a container and its nested items
 */
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
/**
 * Applies locals to a template of particular container
 */
Container.prototype.template = function (locals) {
  // apply locals to this.tplString
  // need a way to include template engine semewhere here
  var self = this,
  ret = {};
  ret[self.tplPlaceholder] = locals;
  return ret;
}

module.exports.Container = Container