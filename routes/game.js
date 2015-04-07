var mongoose = require("mongoose");
var models = require('../models/models');

var Game = models.game;
var Card = models.Card;
var User = models.user;
var CardSet = models.cardset;

var routes = {};

routes.newCardSet = function (req, res) {
/* Create and save new card set based on user input */

	// Get data submitted by user from form
	var cardData = req.body.cards;
	var name = req.body.name;

	// Create new CardSet object
	var newCardSet = new CardSet({name: name, square_set: [cardData]});

	// Save the new card set object to the database
	newCardSet.save(function(err, cardset) {
		if (err) {
			console.error('Cant add new card set', err);
			res.status(500).send("Couldn't add new card set to db");
		}
		console.log(cardset);
		res.send(cardset);
	});

};

routes. login = function (req, res) {
// Allow users to log in as a guest or login with facebook
	// 

}

module.exports = routes;
