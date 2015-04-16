var mongoose = require("mongoose");
var models = require('../models/models');

var Game = models.game;
var Card = models.card;
var User = models.user;
var CardSet = models.cardset;

var routes = {};

routes.home = function (req, res) {
/* Displays all of the available games on the landing page */
//TODO: only display available games if user is logged in

	Game.find({}, function(err, games) {
		if (err) {
			console.error("Couldn't find any games!", err);
			res.status(500).send("Couldn't find any games in the db!");
		};
		console.log(games);
		res.send(games);
	});
};

routes.joinGame = function (req, res) {
/* Create a new card and joins game when user clicks "Join" */
	console.log(req.body.game_id);
	// Get the ID of the game the user chose
	var gameId = req.body.game_id;
	// Set card's initial score
	var initScore = [[false, false, false, false, false]];

	// TODO: set the user to the current user

	// Find the game the user intends to join 
	Game.findOne({_id: gameId}, function(err, game) {
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

			// Assign the squares for the card based on the shuffled square_set deck
			var squares = [
				[square_set[0], square_set[1], square_set[2], square_set[3], square_set[4]]
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