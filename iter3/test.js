var assert = require('assert');
var Containers = require('./containers.js').Containers;

Containers.push({
  name: 'goodbye',
  type: 'MarkupContainer',
  filler: "Good Bye Filler string"
});

assert(Containers.containers['goodbye'], 'Push a new container to a collection');

Containers.render('goodbye', function (err, result) {
  assert.equal(result, "<span>Good Bye Filler string</span>");
  console.log("MarkupContainer with default options - passed.")
});

Containers.push({
  name: 'hello',
  type: 'NestContainer',
  nested: ['goodbye', 'sionara']
});

Containers.push({
  name: 'sionara',
  type: 'MarkupContainer',
  filler: "Sionara Filler string"
});

Containers.push({
  name: 'listing',
  type: 'ListContainer',
  listFiller: function(cb) {
    cb(null, ['one', 'two', 'three', 'four']);
  }
});

Containers.render('hello', function (err, result) {
  console.log(result);
});

Containers.render('listing', function (err, result) {
  console.log(result);
});