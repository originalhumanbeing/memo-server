const express = require('express'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  app = express();

// middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/info', function(req, res) {
  res.send({body: 'memo server. ヽ(^o^)ノ'});
});
// router
app.use(require('./routes/auth'));
app.use(require('./routes/memo'));

// exception handler
app.use((req, res, next) => {
  const err = new Error('Not Found! ＼(｀0´)／');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    body: err.message
  });
});

module.exports = app;