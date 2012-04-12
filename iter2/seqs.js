var Seq = require('seq');
Seq()
    .par(function () {
        console.log('started a');
        var that = this;
        setTimeout(function () { 
          console.log('finished a');
          that(null, 'a');
        }, 800);
    })
    .par(function () {
        console.log('started b');
        var that = this;
        setTimeout(function () { 
          console.log('finished b');
          that(null, 'b');
        }, 600);
    })
    .par(function () {
        console.log('started c');
        var that = this;
        setTimeout(function () { 
          console.log('finished c');
          that(null, 'c');
        }, 200);
    })
    .seq(function (a, b, c) {
        console.dir([ a, b, c ])
    })
;