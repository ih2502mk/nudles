var express = require('express');
var collections = require('./collections.js');
var _ = require('underscore');

var app = express.createServer();

app.register('.html', {
  compile: function (str, options) {
    var template = _.template(str);
    return function (locals) {
      return template(locals);
    };
  }
});

app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/', function(req, res){
  res.render('users', { users: collections.users });
});

app.listen(3000);