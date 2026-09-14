import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { redisClient, isRedisAlive } from "#config/redis.js";
import { setSocketIOInstance } from "./wsBroadcaster.js";
import { registerChatHandlers } from "./handlers/chatHandler.js";
import { registerOrderStreamHandlers } from "./handlers/orderStreamHandler.js";
import { registerStockTrackerHandlers } from "./handlers/stockTrackerHandler.js";
import { registerTrackingHandlers } from "./handlers/trackingHandler.js";
import { logger } from "#config/logger.js";
import env from "#config/env.js";

export const initWebSocketServer = (httpServer) => {
  const allowedOrigins = [
    env.CLIENT_URL,
    "http://localhost:5175",
    "http://localhost:5173",
  ]
    .filter(Boolean)
    .map((url) => url.replace(/\/$/, ""));

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/$/, "");
        const isAllowed =
          allowedOrigins.includes(cleanOrigin) ||
          cleanOrigin.endsWith(".vercel.app");

        callback(null, isAllowed);
      },
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // 1. Attach Redis Pub/Sub Adapter if available
  if (isRedisAlive() && redisClient) {
    try {
      const pubClient = redisClient.duplicate();
      const subClient = redisClient.duplicate();

      pubClient.on("error", (err) =>
        logger.warn({
          msg: "Socket.io Redis PubClient error",
          error: err.message,
        }),
      );
      subClient.on("error", (err) =>
        logger.warn({
          msg: "Socket.io Redis SubClient error",
          error: err.message,
        }),
      );

      io.adapter(createAdapter(pubClient, subClient));
      logger.info({
        msg: "⚡ Socket.io cluster bound to Redis Pub/Sub Adapter",
      });
    } catch (err) {
      logger.warn({
        msg: "Socket.io Redis adapter fallback to in-memory",
        error: err.message,
      });
    }
  }

  // 2. Handshake Cookie Authentication
  const parseSignedCookie = cookieParser(env.COOKIE_SECRET);

  io.use((socket, next) => {
    const rawCookies = socket.handshake.headers.cookie;

    socket.user = null;
    socket.guestSessionId =
      socket.handshake.auth?.guestSessionId ||
      socket.handshake.headers["x-guest-session-id"] ||
      null;

    if (!rawCookies) {
      return next();
    }

    const dummyReq = { headers: { cookie: rawCookies } };
    parseSignedCookie(dummyReq, {}, () => {
      const token =
        dummyReq.signedCookies?.access_token || dummyReq.cookies?.access_token;
      if (token) {
        try {
          const decoded = jwt.verify(token, env.JWT_SECRET);
          socket.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
            avatarUrl: decoded.avatarUrl || null,
          };
        } catch {
          // Token expired or invalid, keep user null (guest)
        }
      }
      next();
    });
  });

  // 3. Mount Handlers & Connection Lifecycle
  setSocketIOInstance(io);

  io.on("connection", (socket) => {
    logger.debug({
      msg: "Socket.io client connected",
      socketId: socket.id,
      user: socket.user ? socket.user.email : "Guest",
      role: socket.user?.role || "guest",
    });

    registerChatHandlers(io, socket);
    registerOrderStreamHandlers(io, socket);
    registerStockTrackerHandlers(io, socket);
    registerTrackingHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      logger.debug({
        msg: "Socket.io disconnected",
        socketId: socket.id,
        reason,
      });
    });
  });

  return io;
};
