var game = require("./routes/game");
var guest = require("./routes/guest.js")

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

app.post('/guest', guest.login);

app.post('/api/new/cardset', game.newCardSet);

mongoose.connect(process.env.MONGOURI || 'mongodb://localhost/test');
var PORT = 3000;

app = app.listen(process.env.PORT || PORT);

// socket.io

sockets(app);
