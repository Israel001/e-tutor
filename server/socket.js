let io;
let socketId;

module.exports = {
  init: httpSever => {
    io = require('socket.io')(httpSever);
    return io;
  },

  getIO: () => {
    if (!io) throw new Error('Socket.io is not initialized!');
    return io;
  },

  initSocket: () => {
    if (!io) throw new Error('Socket.io is not initialized!');
    io.on('connection', socket => {
      socketId = socket.id ;
      socket.on('loggedIn', groupIds => {
        for (let i = 0; i < groupIds.length; i++) {
          socket.join(groupIds[i]);
        }
      });
    });
  },

  getSocketId: () => {
    if (!socketId) throw new Error('SocketId is not initialized!');
    return socketId;
  }
};