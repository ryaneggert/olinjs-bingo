var mongoose = require("mongoose");
var models = require('../models/models');

var Game = models.game;
var Card = models.card;
var User = models.user;
var CardSet = models.cardset;

var routes = {};

routes.home = function(req, res) {
  /* Displays all of the available games on the landing page */
  Game
    .find({
      isFinished: false
    })
    .populate('host')
    .exec(function(err, games) {
      if (err) {
        console.error("Couldn't find any games!", err);
        res.status(500).send("Couldn't find any games in the db!");
        // Is it really a server error if there are no games?
        // Or is this a database error, and no games is represented by
        // games = [] ?
      }
      CardSet
        .find({})
        .populate('creator')
        .exec(function(err, cardsets) {
          if (err) {
            console.error("Error retrieving cardsets!", err);
            res.status(500).send("Error retrieving cardsets!");
          }
          res.send({
            games: games,
            cardsets: cardsets,
            currUser: req.session.user
          }); // an object, to allow the easy addition of more homepage data
        });
    });
};

routes.joinGame = function(req, res) {
  /* Create a new card and joins game when user clicks "Join" */
  // Get the ID of the game the user chose
  console.log(req.body.game_id);
  var gameID = req.body.game_id;
  var currUser = req.session.user;
  console.log('USER', currUser);

  // Find the game the user intends to join and add user to player list

  Game
    .findOne({
      _id: gameID
    })
    .exec(function(err, game) {
      var players = game.players;
      if (players.indexOf(currUser._id) > -1) {
        // Player not on roster. Add.
        players.push(currUser._id);
        game.players = players;
        game.save(function(err2, updgame) {
          if (err || err2) {
            console.log('Error adding user to game.', err, err2);
            res.status(500).send('Error adding user to game');
          }
          res.send(updgame);
        });
      } else {
        // Player already on roster. Send game.
        res.send(game);
      }
    });
};

module.exports = routes;
