var Containers = require('./containers.js').Containers;

Containers.push({
  name: 'hello',
  type: 'NestContainer',
  nested: ['goodbye', 'sionara']
});

Containers.push({
  name: 'goodbye',
  type: 'MarkupContainer',
  filler: "Good Bye Filler string"
});

Containers.push({
  name: 'sionara',
  type: 'MarkupContainer',
  filler: "Sionara Filler string"
});

Containers.render('hello', function (err, result) {
  console.log(result);
});