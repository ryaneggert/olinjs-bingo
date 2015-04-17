var game = require("./routes/game");
var guest = require("./routes/guest.js");
var home = require("./routes/home");

var express = require("express");
var session = require("express-session")
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var sockets = require("./utils/sockets");


var app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

app.get('/', function(req, res) {
  res.send("Hello World This is Bingo!");
});

app.get('/api/home', home.home);

app.post('/guest', guest.login);

app.post('/api/new/cardset', game.newCardSet);

app.post('/api/new/game', game.newGame);

app.get('/api/user/cardsets', game.getUserCardsets);

app.post('/api/join/game', home.joinGame);

mongoose.connect(process.env.MONGOURI || 'mongodb://localhost/test');
var PORT = 3000;

app = app.listen(process.env.PORT || PORT);

// socket.io

sockets(app);