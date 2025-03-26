"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import io, { type Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  error: Error | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  error: null,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Use socket server from environment variable
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    console.log(`Connecting to socket server at ${socketUrl}`);

    const socketInstance = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("Connected to socket server");
      setIsConnected(true);
      setSocket(socketInstance);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setError(err);
      setIsConnected(false);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setIsConnected(false);
    });

    // Clean up on unmount
    return () => {
      console.log("Cleaning up socket connection");
      socketInstance.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, error }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
