var sockets = function(app) {
  var io = require('socket.io')(app);
  io.on('connection', function(socket) {
    console.log('socket connection established');
    socket.emit('error', 'This is a test');
  });























};

module.exports = sockets;
