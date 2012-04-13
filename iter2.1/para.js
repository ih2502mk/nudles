var cp = require('child_process');
var os = require('os');

var _ = require('underscore');

var numCPUs = os.cpus().length;

var paraLize = function(tasks, callback) {
  var results = {};
//  var errors = {}; // consider option for making errors not break everything
  var completed = _.keys(tasks).length;
    
  _.each(tasks, function(element, key){
    tasks[key](function(err){
      var args = Array.prototype.slice.call(arguments, 1);
            
      if(err) {
        callback(err);
        callback = function() {};
      }
      else {
        completed -= 1;
        results[key] = args;
        if(completed === 0) {
          callback(err, results);
        }
      }
    })
  })
};

var childOut = (function(){
  
  var createChildTasks = [];

  var createChildTask = function(cb) {
    var child = {
      processHandle: cp.fork(__dirname + '/child.js'),
//      ready: false,
      numTasks: 0
    }
    
    child.processHandle.on('message', function(m){
//      child.ready = m.ready;
      cb(null, child);
    });
  };

  for(var i = 0; i < numCPUs; i++) {
    createChildTasks.push(createChildTask);
  }
  
  var childProcs = {
    ready : false,
    children : null,
    whenBorn : function(callback){ 
      //just a simple (very simple) promise to execute all 
      //when child procs are born, "children are born"
      var self = this;
      
      if(typeof callback === 'function') {
        self.bornCallbacks.push(callback);
      }
      
      if(self.ready) {
        _.each(self.bornCallbacks, function(i, bornCallback, list) {
          bornCallback();
          list[i] = function() {}
        });
      }
    },
    bornCallbacks : [],
    childPointer : 0,
    giveOut: function (task_key) {
      var child_proc = this.children[this.childPointer].processHandle;
      child_proc.send({'task_key':task_key});
      return this;
    }
  };

  paraLize(createChildTasks, function(err, children){
    childProcs.children = _.toArray(children); // Array is just more comfortable (as it seems)
    childProcs.ready = true;
    childProcs.whenBorn();
  });
  
  /**
   * Tasks are passed in as an array of keys in some global tasks registry
   * child procs require or (include it in some way) that task registry
   */
  return function(task_keys, callback) {
    var results = {};

    var completed = task_keys.length;
    
    childProcs.whenBorn(function(){
      _.each(task_keys, function(task_key){
        
        childProcs.children
        
      })
      
    });
  }
}());

exports.paraLize = paraLize; // no need to expose this actually
exports.childOut = childOut;

/*
para({
  'first' : function(cb) {
    console.log('first fires');
    setTimeout(function(){
      console.log('first fires cb');
      cb(null, 'I\'m first');
    }, 800);
  },
  'second' : function(cb) {
    console.log('second fires');
    setTimeout(function(){
      console.log('second fires cb');
      cb(null, 'I\'m second');
    }, 500);
  },
  'third' : function(cb) {
    console.log('third fires');
    setTimeout(function(){
      console.log('third fires cb');
      cb(null, 'I\'m third');
    }, 300);
  }
},
function(err, results) {
  console.log(results);
});
*/