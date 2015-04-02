var mongoose = require("mongoose");
var supergoose = require("supergoose");
var models = {};

var userSchema = mongoose.Schema({
    name: String,
    // image:String,
});

userSchema.plugin(supergoose); // allows .findOrCreate()
// https://github.com/jamplify/supergoose

var cardsetSchema = mongoose.Schema({
    creator: {
        type: mongoose.Schema.ObjectID,
        ref: 'User'
    },
    square_set: [String], // Potential squares from which we generate cards
    create_date: {
        type: Date,
        default: Date.now
    },
    name: String,

});

var gameSchema = mongoose.Schema({
    card_set: {
        type: mongoose.Schema.ObjectID,
        ref: 'CardSet'
    },
    start_time: Date,
    players: [{
        type: mongoose.Schema.ObjectID,
        ref: 'User'
    }],
    closed: Boolean, // use to determine write permission to .players
    room: String,
    winner: {
        type: mongoose.Schema.ObjectID,
        ref: 'User'
    },
});

gameSchema.methods.timeToStart = function() {
    // return start time - current time (or 0 if game is running)
};

cardSchema = mongoose.Schema({
    score: [
        [Boolean] // For keeping track of filled squares
    ],
    squares: [
        [String]
    ],
    user: {
        type: mongoose.Schema.ObjectID,
        ref: 'User'
    },
    game: {
        type: mongoose.Schema.ObjectID,
        ref: 'Game'
    }
});


models.card = mongoose.model("Card", userSchema);
models.game = mongoose.model("Game", userSchema);
models.cardset = mongoose.model("CardSet", userSchema);
models.user = mongoose.model("User", userSchema);

module.exports = models;
