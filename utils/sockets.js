var mongoose = require("mongoose");
var models = require('../models/models');

var Game = models.game;
var Card = models.card;
var User = models.user;
var CardSet = models.cardset;

var bingomove = function(movedata) {
  console.log(movedata);
  // update card in db
  // send confirmation response
  // socket.emit('response', {'type':'response', 'data':{'error': ...}
};

  // Given a game id, get the current user, generate a card, associate card to
  // user, add socket to game room, and return card via socket.

  // look up game, get cardset
  // Find the game the user intends to join

  //   cb: generate card
  //     cb: store card id in user db
  //       cb: send card to client



var gamehandler = function(data) {
  console.log('handler');
  console.log(data)
  if (data.type === 'move') {
    bingomove(data.data);
  } else {
    console.log('Undefined game type');
  }
};

var sockets = function(app, cookieParser, sessionStore) {
  var socketIO = require('socket.io').listen(app);
  var SessionSockets = require('session.socket.io');
  var io = new SessionSockets(socketIO, sessionStore, cookieParser);

  io.on('connection', function(err, socket, session) {
    console.log('socket connection established');
    console.log(err, session)
    socket.emit('test', 'This is a test');
    socket.on('response', function(data) {
      console.log(data);
    });
    socket.on('game', gamehandler);
  });
};


module.exports = sockets;
