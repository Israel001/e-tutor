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
      socketId = socket.id;
      socket.on('loggedIn', data => {
        for (let i = 0; i < data.groupIds.length; i++) {
          socket.join(data.groupIds[i]);
        }
        for (let i = 0; i < data.conversationIds.length; i++) {
          socket.join(data.conversationIds[i] + data.userId);
        }
        io.emit('online', { user: data.userId, groups: data.groupIds});
      });
      socket.on('typing', data => {
        io.to(data.room).emit('typing', data.userId);
      });
      socket.on('loggedOut', data => {
        for (let i = 0; i < data.groupIds.length; i++) {
          socket.leave(data.groupIds[i], () => {});
        }
        for (let i = 0; i < data.conversationIds.length; i++) {
          socket.leave(data.userId + data.conversationIds[i], () => {});
        }
        io.emit('offline', { user: data.userId, groups: data.groupIds });
      });
    });
  }
};