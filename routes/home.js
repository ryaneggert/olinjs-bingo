var mongoose = require("mongoose");
var models = require('../models/models');

var Game = models.game;
var Card = models.card;
var User = models.user;
var CardSet = models.cardset;

var routes = {};

routes.home = function (req, res) {
/* Displays all of the available games on the landing page */

	if (req.session.user) {
		Game.find({}, function(err, games) {
		if (err) {
			console.error("Couldn't find any games!", err);
			res.status(500).send("Couldn't find any games in the db!");
		};
		console.log(games);
		res.send(games);
	});
	} else {
		res.send("Must be logged in!");
	};
};

routes.joinGame = function (req, res) {
/* Create a new card and joins game when user clicks "Join" */
	console.log(req.body.game_id);
	// Get the ID of the game the user chose
	var gameId = req.body.game_id;

	// TODO: set the user to the current user
	var currUser = req.session.user;
	console.log(currUser);

	// Find the game the user intends to join and add user to player list
	Game.findOneAndUpdate({_id: gameId}, {$push : {"players": currUser}}, function(err, game) {
		if (err) {
			console.error("Couldn't find the specified game! ", err);
			res.status(500).send("Couldn't find the specified game");
		};
		console.log("Game: ");
		console.log(game);

		// Find the square set associated with the current game
		CardSet.findOne({_id: game.card_set}, function(err, cardset) {
			if (err) {
				console.error("Couldn't find the specified cardset!", err);
				res.status(500).send("Couldn't find the specified cardset!");
			};
			console.log("Cardset:");
			console.log(cardset);

			var square_set = cardset.square_set;
			// Order the square set randomly
			square_set.sort(function() {
				return .5 - Math.random();
			});
			console.log(square_set);

			// Set card's initial score
			var initScore = [
				[false, false, false, false, false],
				[false, false, false, false, false],
				[false, false,  true, false, false],
				[false, false, false, false, false],
				[false, false, false, false, false]
			];

			// Assign the squares for the card based on the shuffled square_set deck
			// TODO: make this less stupid with a loop or something
			var squares = [
				[square_set[0], square_set[1], square_set[2], square_set[3], square_set[4]],
				[square_set[5], square_set[6], square_set[7], square_set[8], square_set[9]],
				[square_set[10], square_set[11],   "FREE"   , square_set[13], square_set[14]],
				[square_set[15], square_set[16], square_set[17], square_set[18], square_set[19]],
				[square_set[20], square_set[21], square_set[22], square_set[23], square_set[24]],
			];

			// Create a new bingo card
			var newBingoCard = new Card({game: game._id, score: initScore, squares: squares});

			// Save the new card 
			newBingoCard.save(function(err, card) {
				if (err) {
					console.error("Couldn't create and save the new card! ", err);
					res.status(500).send("Couldn't create and save the new card!");
				};
				console.log("Card:");
				console.log(card);
			});
		});
	});
};

module.exports = routes;