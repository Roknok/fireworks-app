const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve the frontend files (HTML, JS)
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("New client connected");

  // Listen for firework data
  socket.on("firework", (data) => {
    // Broadcast the firework data to all clients
    socket.broadcast.emit("firework", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
