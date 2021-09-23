const express = require('express');
const path = require('path');
const http = require('http');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const request = require("request");
const fs = require('fs');

var port = 3001;
var client_id = "";
var client_secret = "";
var redirect_uri = "";

try {
  const data = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));

  client_id = data.client_id;
  client_secret = data.client_secret;
  redirect_uri = data.redirect_uri;
  port = data.port;
} catch (err) {
  console.error(err)
}

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
}));

app.use(cookieParser());

app.get('/login', function(req, res) {
  // your application requests authorization
  var scope = 'user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri
    }));
});

app.get('/callback', function(req, res) {

  var code = req.query.code || null;

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {

      var access_token = body.access_token;

      var options = {
        url: 'https://api.spotify.com/v1/me/top/artists',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
      };

      res.cookie('access_token', access_token);
      res.redirect('/top');
    }
    else res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
  });
});

//Start the server
server.listen(port, () => console.log(`Server running on port ${port}`));
