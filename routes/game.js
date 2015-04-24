var mongoose = require("mongoose");
var models = require('../models/models');

var Game = models.game;
var Card = models.card;
var User = models.user;
var CardSet = models.cardset;

var routes = {};

routes.newCardSet = function(req, res) {
  /* Create and save new card set based on user input */

  // Get data submitted by user from form
  // TODO: DEFINITELY make this less stupid

  console.log(req.body)

  var square_set = req.body.cards
  var name = req.body.name;

  // Assign current logged in user as creator
  var creator = req.session.user;
  console.log(creator._id);

  // Create new CardSet object
  var newCardSet = new CardSet({
    name: name,
    square_set: square_set,
    creator: creator._id
  });

  // Save the new card set object to the database
  newCardSet.save(function(err, cardset) {
    if (err) {
      console.error('Cant add new card set', err);
      res.status(500).send("Couldn't add new card set to db");
    };
    console.log(cardset);
    res.send(cardset);
  });

};

routes.newGame = function(req, res) {
  /* Create and save a new game with set start time and pre-made card set */

  // Get data submitted by user from form 
  var card_set_id = req.body.card_set_id;
  var room = req.body.room;
  var host_name = req.body.host;

  // Default state of the game is open for play (Change later)
  var isOpen = true;

  // Get start date from user input
  var start_time = req.body.startDate;

  // Find the specified card set
  CardSet.findOne({
    _id: card_set_id
  }, function(err, cardset) {

    if (err) {
      console.error("Couldn't find specified cardset", err);
      res.status(500).send("Couldn't find specified cardset");
    };

    User.findOne({
      name: host_name
    }, function(err, host) {
      if (err) {
        console.error("Couldn't find host user", err);
        res.status(500).send("Couldn't find specified host user");
      };

      var newGame = new Game({
        host: host,
        room: room,
        card_set: cardset,
        start_time: start_time,
        isOpen: isOpen
      });

      // Save the new game to the database
      newGame.save(function(error, game) {
        if (error) {
          console.error("Can't add new game!", error);
          res.status(500).send("Couldn't add new game to db!");
        };

        console.log(game);
        res.send(game);
      });

    });


  });
};

routes.getUserCardsets = function(req, res) {
  /* Gets all of the card sets created by the current logged in user */

  /* // Uncomment this stuff once we have user log in working
	// Get the object Id of the current logged in user to use in query
	var currentUser = req.user._id;

	// Find all of the logged in user's card sets
	CardSet.find({creator: currentUser}, function(err, cardsets) {

	});*/

  // Remove this once we have user login working
  CardSet.find({}, function(err, cardsets) {
    if (err) {
      console.error("Couldn't find card sets", err);
      res.status(500).send("couldn't find any card sets!");
    };
    console.log(cardsets);
    res.send(cardsets);
  });
};

routes.login = function(req, res) {
  // Allow users to log in as a guest or login with facebook


}

module.exports = routes;
