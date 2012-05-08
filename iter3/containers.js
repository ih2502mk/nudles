var util = require("util");

var _ = require("underscore");

var cache = require("./cache.js").cache;

//TODO: all containers should be able to result with pure JSON 
//not applied to templates

//TODO: CSS upstream - every container must be able to add it's own css the 
//upper topmost container will then concatenate all CSS and save it as a bundle
//consider less and stylus preprocessing

//TODO: abstract out temlpate engine, ie remove default 
//tpl strings out of constructors into some pluggable thing

var BasicContainer = function(options) {
  this.name = options.name; // better be unique or namespaced but instace of String
  this.cachePattern = options.cachePattern;
  this.cacheKey = "";
}

/**
 * Applies locals to a template of particular container
 */
BasicContainer.prototype.template = function (locals) {
  var self = this;
  return _.template(self.tplString, locals);
}


var NestContainer = function(options) {
  NestContainer.super_.call(this, options);
  
  this.nested = options.nested || [];
  
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
  
  /**
   * Downstream filler
   * Hardcore assumption:
   * filler must callback with result object, root keys of which are 
   * the same as names of nested containers
   * if they do not match own fillers of nested containers will be used.
   * Has destructive behavior: will change filler functions of nested containers.
   */
  var self = this;
  this.filler = options.filler || function (cb) {
    var fakeNestFillerData = {};
    
    for(var i = self.nested.length; i > 0; i--  ) {
      fakeNestFillerData[self.nested[(i - 1)]] = null;
    }
    
    return cb(null, fakeNestFillerData);
  };
}

util.inherits(NestContainer, BasicContainer);

NestContainer.prototype.render = function (cb) {
  var self = this,
  nesteds = self.nested.length,
  results = {},
  cntnrs = Containers.containers,
  
  finalCb = function(err, results) {
    cb(err, self.template(results));
  };
  
  self.filler( function(err, nestFillerData) {
    if(err) return cb(err);

    for ( var nested_name in nestFillerData ) {

      if ( nestFillerData.hasOwnProperty(nested_name) 
        && cntnrs[nested_name] instanceof BasicContainer ) {
        
        var containerCopy;
        if( nestFillerData[nested_name] ) {
          
          containerCopy = Object.create(cntnrs[nested_name], {
            "filler" : {
              value: function (cb) {
                cb(null, nestFillerData[nested_name]);
              },
              enumerable : true
            }
          });
          
        }
        else {
          containerCopy = cntnrs[nested_name];
        }
        
        containerCopy.render(function(err, str) {
          if (err) {
            cb(err);
            finalCb = function(){};
          }

          nesteds -= 1;

          results[nested_name] = str;

          if (nesteds === 0) {
            return finalCb(err, results);
          }
        })
      }
    }
  });
}

var MarkupContainer = function(options) {
  MarkupContainer.super_.call(this, options);
  
  this.tplString = options.tplString || ("<span><%=" + this.name + "%></span>");
  this.filler = options.filler || "nothing";
}

util.inherits(MarkupContainer, BasicContainer);

MarkupContainer.prototype.render = function(cb) {
  var self = this;
  
  var tplLocals = {};
  
  if (typeof self.filler === 'function') {
    self.filler(function(err, result) {
      if (err) return cb(err);
      
      if (typeof result === 'object') {
        tplLocals = result;
        return cb(null, self.template(tplLocals));
      }
      else {
        tplLocals[self.name] = result;
        return cb(null, self.template(tplLocals));
      }
    })
  }
  else if (typeof self.filler === 'string') {
    tplLocals[self.name] = self.filler;
    return cb(null, self.template(tplLocals));
  }
}

var ListContainer = function(options) {
  ListContainer.super_.call(this, options);
  
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
        
        if (len === 0) {
          return cb(null, self.template({
            "results":results
          }));
        }
      });
    })
  })
}

var Containers = {
  "constructors" : {
    "BasicContainer" : BasicContainer,
    "NestContainer" : NestContainer,
    "ListContainer" : ListContainer,
    "MarkupContainer" : MarkupContainer
  },
  "containers" : {},
  "push" : function(options) {
    var self = this;
    if (options.type && self.constructors[options.type]) {
      self.containers[options.name] = new self.constructors[options.type](options);
    }
  },
  "render" : function(name, cb) {
    var self = this;
    
    if (self.containers[name]) {
      if (cache.valueExist(self.containers[name].cachePattern)) {
        cache.get(self.containers[name].cachePattern, cb);
      }
      else {
        var cacher = function(err, result) {
          cache.set(self.containers[name].cachePattern, result);
          cb(err, result);
        }
        self.containers[name].render(cacher);
      }
    }
    else {
      cb(new Error("Container with name " + name + "does not exist."));
    }
    
    return self;
  }
};

module.exports.Containers = Containers;
