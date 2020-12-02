// server.js
// where your node app starts

// init project
const express = require('express');

const app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// creates a new entry in the users table with the submitted values
app.post('/users', (request, response) => {
  response.sendStatus(200);
});

// drops the table users if it already exists, populates new users table it with just the default users.
app.get('/reset', (request, response) => {
  setup();
  response.redirect('/');
});

// removes all entries from the users table
app.get('/clear', (request, response) => {
  response.redirect('/');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Your app is listening on port ${listener.address().port}`);
});
