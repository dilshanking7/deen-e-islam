/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname: "localhost", port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  let onlineCount = 0;
  const chatHistory = [];
  const liveHistory = [];

  io.on("connection", (socket) => {
    onlineCount++;
    io.emit("online", onlineCount);

    socket.emit("history", { chat: chatHistory.slice(-100), live: liveHistory.slice(-30) });

    socket.on("chat-message", (msg) => {
      chatHistory.push(msg);
      io.emit("chat-message", msg);
    });

    socket.on("live-message", (msg) => {
      liveHistory.push(msg);
      io.emit("live-message", msg);
    });

    socket.on("post", (post) => {
      socket.broadcast.emit("post", post);
    });

    socket.on("disconnect", () => {
      onlineCount = Math.max(0, onlineCount - 1);
      io.emit("online", onlineCount);
    });
  });

  server.listen(port, () => {
    console.log(`> Islaam-E-Deen ready on http://localhost:${port} (socket.io + PWA)`);
  });
});
