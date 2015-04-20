var mongoose = require("mongoose");
var models = require('../models/models');

var Game = models.game;
var Card = models.card;
var User = models.user;
var CardSet = models.cardset;

var routes = {};

routes.home = function(req, res) {
  /* Displays all of the available games on the landing page */

  if (req.session.user) {
    Game.find({}, function(err, games) {
      if (err) {
        console.error("Couldn't find any games!", err);
        res.status(500).send("Couldn't find any games in the db!");
      }
      console.log(games);
      res.send(games);
    });
  } else {
    res.send("Must be logged in!");
  }
};

routes.joinGame = function(req, res) {
  /* Create a new card and joins game when user clicks "Join" */
  console.log(req.body.game_id);
  // Get the ID of the game the user chose
  var gameId = req.body.game_id;

  // TODO: set the user to the current user
  var currUser = req.session.user;
  console.log(currUser);

  // Find the game the user intends to join and add user to player list
  Game.findOneAndUpdate({
    _id: gameId,
    players: {$ne: currUser._id}
  }, {
    $push: {
      "players": currUser._id
    }
  }, function(err, game) {
    if (err) {
      console.error("Couldn't find the specified game! ", err);
      res.status(500).send("Couldn't find the specified game");
    } else {
    	res.send(game);
    }
    console.log("Game: ");
    console.log(game);
  });
};

module.exports = routes;
