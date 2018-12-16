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

// run
app.listen(8080, () => {
    console.log('Server started!');
});