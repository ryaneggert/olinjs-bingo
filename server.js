var express = require("express");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var sockets = require("./utils/sockets");

var home = require("./routes/home");
var game = require("./routes/game");

var app = express();


app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get('/', function(req, res) {
  res.send("Hello World This is Bingo!");
});

app.get('/api/home', home.home);

app.post('/api/new/cardset', game.newCardSet);

app.post('/api/new/game', game.newGame);

app.get('/api/user/cardsets', game.getUserCardsets);

app.post('/api/join/game', home.joinGame);

mongoose.connect(process.env.MONGOURI || 'mongodb://localhost/test');
var PORT = 3000;

app = app.listen(process.env.PORT || PORT);

// socket.io

sockets(app);
