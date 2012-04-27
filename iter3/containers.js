var util = require("util");

var _ = require("underscore");

var BasicContainer = function(options) {

}

/**
 * Applies locals to a template of particular container
 */
BasicContainer.prototype.template = function (locals) {
  var self = this;
  console.log(self.name);
  console.log(self.tplString);
  console.log(locals);
  return _.template(self.tplString, locals);
}

var NestContainer = function(options) {
  this.nested = options.nested || [];
  this.name = options.name; // better be unique or namespaced but instace of String
  if (!options.tplString) {
    this.tplString = "";
    for (var i = 0; i < this.nested.length; i++) {
      this.tplString += "<span><%=" + this.nested[i] + "%></span>"
    }
  }
  else {
    this.tplString = options.tplString;
  }
}

util.inherits(NestContainer, BasicContainer);

NestContainer.prototype.render = function (cb) {
  var self = this,
  nesteds = self.nested.length,
  results = {},
  cntnrs = Containers.containers,
  
  innerCb = function(err, results) {
    cb(err, self.template(results));
  };
  
  self.nested.forEach(function(nested_name){
    cntnrs[nested_name].render(function(err, str) {
      if (err) {
        cb(err);
        innerCb = function(){};
      }

      nesteds -= 1;

      results[nested_name] = str;

      if (nesteds === 0) {
        innerCb(err, results)
      }
    });
  });
}

var MarkupContainer = function(options) {
  this.name = options.name; // better be unique or namespaced but instace of String
  this.tplString = options.tplString || ("<span><%=" + this.name + "%></span>");
  this.filler = options.filler || "nothing";
}

util.inherits(MarkupContainer, BasicContainer);

MarkupContainer.prototype.render = function(cb) {
  var self = this;
  
  if (typeof self.filler === 'function') {
    self.filler(function(err, result) {
      if(err) return cb(err);
      cb(null, self.template(result));
    })
  }
  else if (typeof self.filler === 'string') {
    var locals = {};
    locals[self.name] = self.filler;
    cb(null, self.template(locals));
  }
}

var ListContainer = function(options) {
  this.name = options.name; // better be unique or namespaced but instace of String
  this.tplString = options.tplString || ("<span><%=" + this.name + "%></span>");
  this.listFiller = options.listFiller;
  this.item = options.item || options.name + "_item";
  
  var item_name;
  
  if(typeof Containers.containers[item_name] === 'undefined') {
    Containers.push({
      "type" : MarkupContainer,
      "name" : item_name
    })
  }
}

util.inherits(ListContainer, BasicContainer);

ListContainer.prototype.render = function(cb) {
  var self = this,
  result = "";
  
  self.listFiller(function(err, listData) {
    if(err) return cb(err);
    
    listData.forEach(function(listDataItem) {
      self.item.filler = function() {return listDataItem;}
      self.item.render(function(err, str) {
        if (err) return cb(err);
        result += str;
      });
    })
  })
}

var Containers = {
    "push": function(options) {
      var self = this;
      if(options.type && self.constructors[options.type]) {
        self.containers[options.name] = new self.constructors[options.type](options);
      }
    },
    "constructors" : {
      "BasicContainer" : BasicContainer,
      "NestContainer" : NestContainer,
      "ListContainer" : ListContainer,
      "MarkupContainer" : MarkupContainer
    },
    containers : {},
    render: function(name, cb) {
      var self = this;
      if(self.containers[name]) {
        self.containers[name].render(cb);
      }
      else {
        cb(new Error("Container with name " + name + "does not exist."));
      }
    }
  };

module.exports.Containers = Containers;