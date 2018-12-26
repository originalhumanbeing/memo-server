const express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    env = process.env.NODE_ENV || 'development',
    app = express();

const config = require('./config')[env];

// middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// router
app.use(require('./routes/auth'));
app.use(require('./routes/memo'));

// exception handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        body: err.message
    });
});

// run
app.listen(config.serverPort, () => {
    console.log('Server started!');
});

module.exports = app;