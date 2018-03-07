var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 4000;

var query;
server.listen(port, function(){
  console.log('listening on %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));
// app.get('/', function(req, res) {
//   res.sendFile(__dirname + '/index.html');
// });
app.get('/webapp', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/webapp/index.html'));
  query = req.query.roomId;
  console.log('webapp routing - ' + query);
});

app.get('/feed', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/feed.html'));
    query = req.query.roomId;
    console.log('feed routing - ' + query);
});

app.get('/balljump', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/balljump/index.html'));
  query = req.query.roomId;
  console.log('webapp routing - ' + query);
});

//Chatroom

var numUsers = 0;

io.sockets.on('connection', function(socket){
  var addedUser = false;

  // set set connection to existing room, or set room to default of room '1'
  if (socket.roomname) {
      console.log('already have a room - ' + socket.roomname);
  } else {
    socket.roomname = '1';
  }

  socket.on('room', function(room) {
    socket.join(room);
  });

  socket.on('query request', function() {
    console.log('query request received');
    if (query) {
      console.log('there is a query - ' + query);

      socket.emit('query', query);
    } else {
      console.log('no query found');

      socket.emit('use random room');
    }
  });

  // when the client emits 'new message', this listens and executes
  socket.on('chat message', function(data){

    //we tell the client to execute 'new message'

    socket.emit('message received', 'CISCO VISION - Thanks we got your message!');
    socket.broadcast.to(socket.roomname).emit('chat message', {
      username: socket.username,
      message: data
    });
  });

  socket.on('any other action', function(someaction) {

    socket.emit('action received', 'We receieved our action thanks!');
    socket.broadcast.to(socket.roomname).emit('do action', {
      username: socket.username,
      action: someaction
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function(data) {
    if (addedUser) return;

    var chatdata = '';

    // if not valid json object, parse
    try {
        chatdata = JSON.parse(data);
    } catch (e) {
        chatdata = data;
    }

    // we store the username in the socket session for this client
    socket.username = chatdata.username;
    ++numUsers;
    addedUser = true;


    socket.roomname = chatdata.roomname;

    console.log("New User " + socket.username + " added to room " + socket.roomname);

    socket.emit('login', {
      numUsers: numUsers,
      roomname: socket.roomname
    });

    // echo globally (all clients) that a person has connected
    socket.broadcast.to(socket.roomname).emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.to(socket.roomname).emit('typing', {
      username: socket.username
    });
  });

  socket.on('stop typing', function () {
    socket.broadcast.to(socket.roomname).emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function() {
    if (addedUser) {
      --numUsers;

      //echo globally that this client has left
      socket.broadcast.to(socket.roomname).emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

});
