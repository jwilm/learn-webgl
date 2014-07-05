var express = require('express');

var app = express();

app.use(express.static(__dirname + '/public'));

app.route('/').get(function(req, res, next) {
  res.sendfile('index.html');
});

console.log('Starting Express');
app.listen(3000);
