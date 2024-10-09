const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
// const crypto = require("crypto").webcrypto;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(
  cors({
    origin: "*",
  })
);

io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  
  socket.on("chatMessage", async (encryptedMsg, displayName) => {
    console.log(encryptedMsg)
    io.emit("chatMessage", encryptedMsg, displayName);
  });
  
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
