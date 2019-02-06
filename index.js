const app = require("./app"),
  env = process.env.NODE_ENV || 'development';

const config = require('./config')[env];
// run
app.listen(config.serverPort, () => {
  console.log('Server started!');
});
