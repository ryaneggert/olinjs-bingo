var game = require('../routes/game.js');

var bingomove = function(movedata) {
  game.updatecard(movedata);
};
var gamehandler = function(data, socket) {
  if (data.type === 'move') {
    bingomove(data.data);
  } else {
    console.log('Undefined game type');
  }
};

var sockets = function(app) {
  var io = require('socket.io')(app);
  io.on('connection', function(socket) {
    console.log('socket connection established');
    socket.emit('test', 'This is a test');
    socket.on('response', function(data) {
      console.log(data);
    });
    socket.on('game', gamehandler);
  });
};


module.exports = sockets;
