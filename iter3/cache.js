var context = require("./context.js").context;

var Cache = function() {
  this.memoryStorage = {};
  this.patterns = [];
}

/**
 *  Examples of patterns:
 *  pattern = "level:authUser/user_id:viewed/post/post_id"
 *  =>
 *  key = self.patterns.indexOf(pattern).toString() + "@" + "html:456:123"
 *  
 *  pattern = "level:authUser/user_id:viewed/post/post_id"
 *  =>
 *  key = self.patterns.indexOf(pattern).toString() + "@" + "html:*:123"
 */

Cache.prototype.keyGen = function(pattern) {
  var self = this;
  
  var patternNumber = self.patterns.indexOf(pattern);
  
  if ( patternNumber === -1) {
    patternNumber = self.patterns.push(pattern) - 1;
  }
  
  var values = [];
  
  var groups = pattern.split(':');
  
  for(var i = 0; i < groups.length; i++) {
    var stack = context;
    
    var parts = groups[i].split('/');
    
    for(var j = 0; j < parts.length; j++) {
      if ( typeof stack[parts[j]] !== 'object' 
        && typeof stack[parts[j]] !== 'array' ) {
        values.push(stack[parts[j]]);
      }
      else {
        stack = stack[parts[j]];
      }
    }
  }
  
  return patternNumber + '@' + values.join(':');
}

Cache.prototype.set = function(pattern, value) {
  var self = this;
  
  self.memoryStorage[self.keyGen(pattern)] = value;
}

Cache.prototype.get = function(pattern, cb) {
  var self = this;
  
  return cb(null, self.memoryStorage[self.keyGen(pattern)]);
}

Cache.prototype.valueExist = function(pattern) {
  var self = this;
  
  //return self.memoryStorage.hasOwnProperty(self.keyGen(pattern));
  return false;
}

module.exports.cache = new Cache();
