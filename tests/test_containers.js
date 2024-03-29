var assert = require('assert');
var Containers = require('../containers.js').Containers;

module.exports = function() {
  //MarkupContainer with default options.
  Containers.push({
    name: 'goodbye',
    type: 'MarkupContainer'
  });

  assert(Containers.containers['goodbye'], 'Push a new container to a collection');

  Containers.render('goodbye', function (err, result) {
    assert.equal(result, "<span>nothing</span>");
    console.log("MarkupContainer with default options - passed.")
  });

  //MarkupContainer with string filler.
  Containers.push({
    name: 'goodbye',
    type: 'MarkupContainer',
    filler: "Good Bye Filler string"
  });

  assert(Containers.containers['goodbye'], 'Push a new container to a collection');

  Containers.render('goodbye', function (err, result) {
    assert.equal(result, "<span>Good Bye Filler string</span>");
    console.log("MarkupContainer with string filler - passed.")
  });

  //MarkupContainer with function filler and string result.
  Containers.push({
    name: 'goodbye',
    type: 'MarkupContainer',
    filler: function(cb) {
      cb(null, 'Filler fn result')
    }
  });

  assert(Containers.containers['goodbye'], 'Push a new container to a collection');

  Containers.render('goodbye', function (err, result) {
    assert.equal(result, "<span>Filler fn result</span>");
    console.log("MarkupContainer with function filler and string result - passed.")
  });

  //MarkupContainer with function filler and object result and template.
  Containers.push({
    name: 'sionara',
    type: 'MarkupContainer',
    filler: function(cb) {
      cb(null, {
        "foo": "foo value",
        "bar": "bar value",
        "baz": "baz value"
      })
    },
    tplString: "<div><%= foo %></div><p><%= bar %></p><span><%= baz %><span>"
  });

  Containers.render('sionara', function(err, result) {
    assert.equal(result, "<div>foo value</div><p>bar value</p><span>baz value<span>");
    console.log("MarkupContainer with function filler and object result and template - passed.");
  })

  //NestContainer with default template
  Containers.push({
    name: 'hello',
    type: 'NestContainer',
    nested: ['goodbye', 'sionara']
  });

  Containers.render('hello', function (err, result) {
    assert.equal(result, '<div><div><span>Filler fn result</span></div><div><div>foo value</div><p>bar value</p><span>baz value<span></div></div>');
    console.log("NestContainer with default template - passed");
  });

  //NestContainer with template
  Containers.push({
    name: 'hello',
    type: 'NestContainer',
    nested: ['goodbye', 'sionara'],
    tplString: "<div><p><%= goodbye %></p><hr /><p><%= sionara %></p></div>"
  });

  Containers.render('hello', function (err, result) {
    assert.equal(result, '<div><p><span>Filler fn result</span></p><hr /><p><div>foo value</div><p>bar value</p><span>baz value<span></p></div>');
    console.log("NestContainer with template - passed");
  });

  //NestContainer with downstream filler and template
  Containers.push({
    name: 'hello',
    type: 'NestContainer',
    nested: ['goodbye', 'sionara'],
    tplString: "<div><p><%= goodbye %></p><hr /><p><%= sionara %></p></div>",
    filler: function(cb) {
      cb(null, {
        "goodbye" : "dnstrm string goodbye value",
        "sionara" : {
          "foo" : "dnstrm foo",
          "bar" : "dnstrm bar",
          "baz" : "dnstrm baz"
        }
      })
    }
  });

  Containers.render('hello', function (err, result) {
    assert.equal(result, '<div><p><span>dnstrm string goodbye value</span></p><hr /><p><div>dnstrm foo</div><p>dnstrm bar</p><span>dnstrm baz<span></p></div>');
    console.log("NestContainer with downstream filler and template - passed");
  });

  //List container with array of strings filler
  Containers.push({
    name: 'listing',
    type: 'ListContainer',
    listFiller: function(cb) {
      cb(null, ['one', 'two', 'three', 'four']);
    }
  });

  Containers.render('listing', function (err, result) {
    assert.equal(result, '<ul><li><span>one</span></li><li><span>two</span></li><li><span>three</span></li><li><span>four</span></li></ul>');
    console.log("List container with array of strings filler - passed");
  });
}