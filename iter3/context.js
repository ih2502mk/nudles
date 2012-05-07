
var Context = function() {
//Dummy context with no meaning

  this["route"] = "post/123"
  
  this["level"] = "html"; //"html/ajax/form"
  
  this["page"] = "some_page";
  
  this["authUser"] = {
    "user_id" : "456",
    "login" : "js",
    "first_name" : "John",
    "last_name" : "Smith"
  }
  
  this["viewed"] = {
    "user" : null,
    
    "post" : {
      "post_id" : 123,
      "data" : {}
    }
    
  }
}

module.exports.context = new Context();