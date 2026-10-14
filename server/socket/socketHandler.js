import { Server } from 'socket.io';

let ioInstance = null;

export const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log(`⚡ WebSocket client connected: ${socket.id}`);

    // Join order room for specific tracking
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`Socket ${socket.id} joined order room: order:${orderId}`);
    });

    // Join admin room
    socket.on('join:admin', () => {
      socket.join('admin_channel');
      console.log(`Socket ${socket.id} joined admin channel`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = () => ioInstance;
