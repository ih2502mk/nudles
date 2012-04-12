//contrib stuff
var connect = require('connect');
var Seq = require('seq');

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
  
  Seq()
    .par(function(req){
      var that = this;
      collections.getUsers(function(err, users) {
        that(err, usersTpl({"users" : users}));
      })
    })
    .par(function(req){
      var that = this;
      collections.getPosts(function(err, posts) {
        that(err, postsTpl({"posts" : posts}));
      })
    })
    .seq(function(users, posts) {
      res.write(bodyTpl({"body" : users + posts}));
      res.end();
    })
    ;
    
  })
.listen(3000);