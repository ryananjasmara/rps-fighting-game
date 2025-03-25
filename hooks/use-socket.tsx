"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Tambahkan logging untuk debugging

  useEffect(() => {
    // Gunakan URL socket server eksternal
    // Pastikan ini mengarah ke socket server yang sudah Anda jalankan
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    console.log(`Connecting to socket server at ${socketUrl}`);

    const socketInstance = io(socketUrl, {
      // Tambahkan opsi untuk menangani CORS jika diperlukan
      withCredentials: false,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Connected to socket server");
      setIsConnected(true);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setIsConnected(false);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      console.log("Cleaning up socket connection");
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
