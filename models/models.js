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
    type: mongoose.Schema.ObjectId,
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
    type: mongoose.Schema.ObjectId,
    ref: 'CardSet'
  },
  start_time: Date,
  players: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  closed: Boolean, // use to determine write permission to .players
  room: String,
  winner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
});

gameSchema.methods.timeToStart = function() {
  var start_time = this.start_time;
  var time_now = Date.now();
  if (time_now < start_time) {
    // return seconds until start
    return (start_time - time_now) / 1000;
  } else {
    return 0;
  }
};

cardSchema = mongoose.Schema({
  score: {}, //This needs to be a nested array of booleans
  squares: {},  //This needs to be a nested array of strings that matches the score array
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  game: {
    type: mongoose.Schema.ObjectId,
    ref: 'Game'
  }
});


models.card = mongoose.model("Card", cardSchema);
models.game = mongoose.model("Game", gameSchema);
models.cardset = mongoose.model("CardSet", cardsetSchema);
models.user = mongoose.model("User", userSchema);

module.exports = models;
