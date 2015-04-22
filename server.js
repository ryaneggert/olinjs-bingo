var game = require("./routes/game");
var guest = require("./routes/guest.js");
var home = require("./routes/home");
var mainr = require("./routes/index");
var auths = require("./routes/auths");

var express = require("express");
var session = require("express-session");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var sockets = require("./utils/sockets");

var CookieParser = cookieParser('secret');
var sessionStore = new session.MemoryStore();


var app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(CookieParser);
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: 'secret',
  resave: false,
  store: sessionStore,
  saveUninitialized: true
}));

app.use('/auth', auths);

app.get('/api/home', home.home);

app.post('/guest', guest.login);

app.post('/api/new/cardset', game.newCardSet);

app.post('/api/new/game', game.newGame);

app.post('/api/game/initialize', game.init);

app.get('/api/user/cardsets', game.getUserCardsets);

app.post('/api/join/game', home.joinGame);

app.get('/*', auths.isAuth_pg, mainr.main);

mongoose.connect(process.env.MONGOURI || 'mongodb://localhost/bingo');
var PORT = 3000;

app = app.listen(process.env.PORT || PORT);

// socket.io

sockets(app, CookieParser, sessionStore);
