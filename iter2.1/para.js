var cp = require('child_process');
var os = require('os');

var _ = require('underscore');

var numCPUs = os.cpus().length;

var paraLize = function(tasks, callback) {
  var results = {};
//  var errors = {}; // consider option for making errors not break everything
  var toComplete = _.keys(tasks).length;
    
  _.each(tasks, function(element, key){
    tasks[key](function(err){
      var args = Array.prototype.slice.call(arguments, 1);
            
      if(err) {
        callback(err);
        callback = function() {};
      }
      else {
        toComplete -= 1;
        results[key] = args;
        if(toComplete === 0) {
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
      
      this.incChildPointer();
      return child_proc;
    },
    incChildPointer : function() { // may gain some fancy logic in future
      this.childPointer += 1;
      if(this.childPointer >= this.children.length) {
        this.childPointer = 0;
      }
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

    var toComplete = task_keys.length;
    
    var observe = function(message) {
      if(message.task_complete) {
        if(!message.err) {
          results[message.task_key] = message.result;
          toComplete -= 1;

          if(toComplete === 0) {
            callback(null, results);
          }
        }
        else {
          callback(message.err);
        }
      }
      else {
        // process child messages
      }
    }
    
    childProcs.whenBorn(function(){
      _.each(task_keys, function(task_key){
        
        childProcs.giveOut(task_key).on('message', observe);
        
      })
      
    });
  }
}());

exports.paraLize = paraLize; // no need to expose this actually
exports.childOut = childOut;