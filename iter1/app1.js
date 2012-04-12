var connect = require('connect');
var collections = require('./collections.js');
var _ = require('underscore');
var tplcpl = require('./tpl.js').tplcpl;

var app = connect();

var bodyTpl = tplcpl('./views/body.html')
  , usersTpl = tplcpl('./views/users.html')
  , postsTpl = tplcpl('./views/posts.html')


;app
  .use('/public', connect.static(__dirname + '/public', { maxAge: 0 }))
  .use(function(req, res) {
    res.setHeader("Content-Type", "text/html");
    var body = '';
    var cb_count = 0;
    
/*
 * Looks ugly, but generally solves the problem.
 * The moment of response is determined with the help of 
 * cb_count var. 
 */
    
    collections.getUsers(function(err, users) {
      body += usersTpl({"users" : users});
      
      cb_count++;
      
      if(cb_count == 2) {
        res.write(bodyTpl({"body" : body}));
        res.end();
      }
    });
    
    collections.getPosts(function(err, posts) {
      body += postsTpl({"posts" : posts});
      
      cb_count++;
      
      if(cb_count == 2) {
        res.write(bodyTpl({"body" : body}));
        res.end();
      }
    });
    
  })
.listen(3000);


/*
var connect = require('./connect');

var app = connect()
  .use('/public', connect.static(__dirname + '/public'))
  .use( function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.end('<img src="/public/car.jpg" />');
  })
.listen(3000);
*/