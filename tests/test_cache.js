var assert = require('assert');

var cache = require("../cache.js").cache;

module.exports = function() {
  console.log(cache.keyGen('level:authUser/user_id:viewed/post/post_id'));
  console.log(cache.keyGen('level:authUser/user_id/*:viewed/post/post_id'));
}