const Message = require('../models/Message');
const User = require('../models/User');

const onlineUsers = new Map();

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);

    socket.on('userOnline', async (userId) => {
      onlineUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
      try {
        const newMessage = await Message.create({ sender: senderId, receiver: receiverId, message });
        const populated = await newMessage.populate('sender', 'username');

        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) io.to(receiverSocket).emit('receiveMessage', populated);
        socket.emit('messageSent', populated);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ senderId, receiverId }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) io.to(receiverSocket).emit('userTyping', { senderId });
    });

    socket.on('stopTyping', ({ senderId, receiverId }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) io.to(receiverSocket).emit('userStoppedTyping', { senderId });
    });

    socket.on('disconnect', async () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: Date.now() });
          io.emit('onlineUsers', Array.from(onlineUsers.keys()));
          break;
        }
      }
    });
  });
};

module.exports = initSocket;