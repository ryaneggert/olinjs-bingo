var game = require('../routes/game.js');

var bingomove = function(movedata) {
  game.updatecard(movedata);
};

var getroomusers = function(io, roomid) {
  var roompop = io.nsps['/'].adapter.rooms[roomid];
  // get user data for each socket
  var users = [];
  for (var usersocketid in roompop) {
    this_socket = io.sockets.connected[usersocketid];
    users.push(this_socket.olinjsdata.user);
  }
  return users;
};

var bingojoin = function(data, socket, io) {
  // Get user's game & name
  var gameid = data.game;
  var userid = data.user._id;
  var username = data.user.name;
  // Join this socket to the game's room
  socket.join(gameid);
  socket.olinjsdata.user = data.user;
  var users = getroomusers(io, gameid);
  // Send a connection event with current players to room.
  io.to(gameid).emit('joinroom', {
    players: users
  });
};

var sockets = function(app) {
  var io = require('socket.io')(app);

  io.on('connection', function(socket) {
    socket.onclose = function(reason) {
      // Modify standard .onclose method to save roomdata on disconnect
      var allrooms = socket.adapter.sids[socket.id];
      socket.olinjsdata.roomlist = allrooms; // Save list of rooms user was in
      Object.getPrototypeOf(this).onclose.call(this, reason);
      // call default .onclose method ^
    };
    socket.olinjsdata = {};
    console.log('socket connection established');
    socket.emit('test', 'This is a test');
    socket.on('response', function(data) {
      console.log(data);
    });
    socket.on('game', function(data) {
      if (data.type === 'join') {
        bingojoin(data.data, socket, io);
      } else if (data.type === 'move') {
        bingomove(data.data);
      } else {
        console.log('Undefined game type');
      }
    });
    socket.on('disconnect', function(data) {
      console.log('Disconnect');
      var formerrooms = socket.olinjsdata.roomlist;
      var userinfo = socket.olinjsdata.user;
      //clear our room storage object
      delete socket.olinjsdata;
      for (var room in formerrooms) {
        var users = getroomusers(io, room);
        io.to(room).emit('leaveroom', {
          players: users
        });
      }
      io.emit('user disconnected');
    });
  });
};

module.exports = sockets;
