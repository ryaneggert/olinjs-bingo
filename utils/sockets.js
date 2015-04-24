var game = require('../routes/game.js');

var bingomove = function(movedata) {
  game.updatecard(movedata);
};

var bingojoin = function(data, socket, io) {
  // Get user's game & name
  console.log('bingojoin fxn')
  var gameid = data.game;
  var userid = data.user._id;
  var username = data.user.name;
  console.log(data);
  // Join this socket to the game's room
  socket.join(gameid);
  socket.olinjsdata.user = data.user;
  // Send a connection event with user name to room.
  io.to(gameid).emit('joinroom', {
    user: {
      'name': username,
      '_id': userid,
    }
  });
};

var sockets = function(app) {
  var io = require('socket.io')(app);

  io.on('connection', function(socket) {
    socket.onclose = function(reason) {
      var allrooms = socket.adapter.sids[socket.id];
      socket.olinjsdata.roomlist = allrooms;
      Object.getPrototypeOf(this).onclose.call(this, reason);
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
        io.to(room).emit('leaveroom', {
          players: {
            'name': userinfo.name,
            '_id': userinfo._id,
          }
        });
      }
      io.emit('user disconnected');
    });
  });
};


module.exports = sockets;
