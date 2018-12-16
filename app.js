const express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    app = express();

// middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// router
app.use(require('./routes/auth'));
app.use(require('./routes/memo'));

app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.json({'errors': {
            message: err.message,
            error: {}
        }});
});


// run
app.listen(8080, () => {
    console.log('Server started!');
});