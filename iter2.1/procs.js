//core stuff
var cp = require('child_process');
var os = require('os');

//contrib stuff
var _ = require('underscore');

//custom stuff
var para = require('./para.js');
var paraLize = para.paraLize;
var childOut = para.childOut;

childOut(['task1', 'task2', 'task3'], function(err, results) {
  console.log(results);
})
//this fails
childOut(['task3', 'task4', 'task5'], function(err, results) {
  console.log(results);
})
