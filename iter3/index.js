var tako = require('tako'),
path = require('path'),
app = tako();

app.route('/static/*').files(path.join(__dirname, 'static'))

app.route('/hello.json').json({msg:'hello!'})

app.route('/plaintext').text('I like text/plain')

app
  .route('/')
  .html(function (req, resp) {
    resp.end('<html><head>cool</head><body>'+'Tako body test'+'</body></html>')
  })
  .methods('GET')
  ;


app.httpServer.listen(8080)