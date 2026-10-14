import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // In local dev, connect to port 5000 or relative proxy
    const socketInstance = io(window.location.origin.includes('5173') ? 'http://localhost:5000' : window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected to backend:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinOrderRoom = (orderId) => {
    if (socket && orderId) {
      socket.emit('join:order', orderId);
    }
  };

  const joinAdminRoom = () => {
    if (socket) {
      socket.emit('join:admin');
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinOrderRoom,
        joinAdminRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
