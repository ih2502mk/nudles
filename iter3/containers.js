var util = require("util");

var _ = require("underscore");

var BasicContainer = function(options) {

}

/**
 * Applies locals to a template of particular container
 */
BasicContainer.prototype.template = function (locals) {
  var self = this;
  return _.template(self.tplString, locals);
}

var NestContainer = function(options) {
  this.nested = options.nested || [];
  this.name = options.name; // better be unique or namespaced but instace of String
  if (!options.tplString) {
    this.tplString = "<div>";
    for (var i = 0; i < this.nested.length; i++) {
      this.tplString += "<div><%=" + this.nested[i] + "%></div>"
    }
    this.tplString += "</div>";
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
  this.tplString = options.tplString || ("<ul><% _.each(results, function(result) { %> <li><%= result %></li> <% }); %></ul>");
  
  this.item = options.item || options.name + "_item";
  
  var item_name = this.item;
  
  if(typeof Containers.containers[item_name] === 'undefined') {
    Containers.push({
      "type" : 'MarkupContainer',
      "name" : item_name
    })
  }
  
  this.listFiller = options.listFiller || function(cb){
    var dumb_filer_data = {};
    dumb_filer_data[item_name] = 'list is empty...';
    return cb(null, [dumb_filer_data]) 
  };
}

util.inherits(ListContainer, BasicContainer);

ListContainer.prototype.render = function(cb) {
  var self = this,
  results = [],
  cntnrs = Containers.containers;
  
  self.listFiller(function(err, listData) {
    if(err) return cb(err);
    
    var len = listData.length;
    
    listData.forEach(function(listDataItem, i) {
      cntnrs[self.item].filler = function(filler_cb) {
        var normalized = {};
        if( typeof listDataItem === 'string') {
          normalized[self.item] = listDataItem;
          
          return filler_cb(null, normalized);
        }
        
        return filler_cb(null, listDataItem);
      }
      
      cntnrs[self.item].render(function(err, str) {
        if (err) return cb(err);
        
        len -= 1;
        
        results[i] = str;
        
        if(len === 0) {
          cb(null, self.template({"results":results}));
        }
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
