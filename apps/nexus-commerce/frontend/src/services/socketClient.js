import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

let socket = null;

export const getSocket = () => {
  if (!socket && typeof window !== "undefined") {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socket;
};
