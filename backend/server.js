const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors({
  origin: "*",
}));

const connectedUsers = [];
let publicKeys = []; 

io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  
  connectedUsers.push({ id: socket.id, socket }); 

  // if (connectedUsers.length === 2) {
  //   io.emit('usersReady');
  // }

  socket.on("sendPublicKey", (publicKeyJwk, publicKeyHex) => {
    console.log('Received public key', publicKeyHex);

    publicKeys.push({ publicKeyJwk, publicKeyHex });

    if (publicKeys.length === 2) {
      
      connectedUsers.forEach((user, index) => {
        const otherIndex = index === 0 ? 1 : 0; 
        user.socket.emit("exchangePublicKey", publicKeys[otherIndex].publicKeyJwk, publicKeys[otherIndex].publicKeyHex);
      });

      // publicKeys = []; 
    }
  });

  socket.on("chatMessage", (encryptedMsg, displayName) => {
    io.emit("chatMessage", encryptedMsg, displayName);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    const index = connectedUsers.findIndex(user => user.id === socket.id);
    if (index !== -1) {
      connectedUsers.splice(index, 1);
      publicKeys.splice(index, 1);
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
