var sockets = function(app) {
  var io = require('socket.io')(app);
  io.on('connection', function(socket) {
    console.log('socket connection established');
    socket.emit('test', 'This is a test');
    socket.on('response', function(data) {
      console.log(data);
    });
  });
};

module.exports = sockets;
