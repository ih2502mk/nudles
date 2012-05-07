
var Cache = function() {
  this.memoryStorage = {};
}

/**
 *  pattern = "level/html:authUser/user_id:viewed/post/post_id"
 *  =>
 *  key = "html:456:123" - ambiguity ???
 */

Cache.prototype.keyGen = function(pattern) {
  return "some string key";
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
