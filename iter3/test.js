var Containers = require('./containers.js').Containers;

Containers.push({
  type: 'NestContainer',
  name: 'hello',
  nested: ['goodbye', 'sionara']
});

Containers.push({
  type: 'MarkupContainer',
  name: 'goodbye',
  filler: "Good Bye Filler string"
});

Containers.push({
  type: 'MarkupContainer',
  name: 'sionara',
  filler: "Sionara Filler string"
});

Containers.render('hello', function (err, result) {
  console.log(result);
});