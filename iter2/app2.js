//contrib stuff
var connect = require('connect');
var async = require('async');

//custom stuff
var collections = require('./collections.js');
var tplcpl = require('./tpl.js').tplcpl;

var app = connect();

var bodyTpl = tplcpl('./views/body.html')
  , usersTpl = tplcpl('./views/users.html')
  , postsTpl = tplcpl('./views/posts.html')


;app
  .use('/public', connect.static(__dirname + '/public', { maxAge: 0 }))
  .use(function(req, res) {
    res.setHeader("Content-Type", "text/html");
  
    async
      .parallel({
        'users': function(cb){
          collections.getUsers(function(err, users) {
            if(!err) {
              cb(err, usersTpl({"users" : users}));
            }
            else cb(err);
          })
        },
        
        'posts': function(cb) {
          collections.getPosts(function(err, posts) {
            if(!err) {
              cb(err, postsTpl({"posts" : posts}));
            }
            else cb(err);
          })
        }
      },
      function(err, result){
        res.write(bodyTpl({"body" : result.users + result.posts}));
        res.end();
      });
    
  })
.listen(3000);