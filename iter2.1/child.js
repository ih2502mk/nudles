var tasks = require('./tasks.js').tasks;

process.on('message', function(m) {
  
  if (m.task_key) {
    tasks[m.task_key](function(err, result){
      process.send({
        task_complete: true,
        err: err,
        result: result,
        task_key: m.task_key
      });
    })
  }
});

process.send({ ready: 'ready'});