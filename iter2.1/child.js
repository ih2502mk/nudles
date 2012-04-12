process.send({ ready: 'ready'});

process.on('message', function(m) {
  console.log('CHILD got message:', m);
});