const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

//Port from environment variable or default - 4001
const port = 9000;

//Setting up express and adding socketIo middleware
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

var clients = {};

var num = 0;

//Setting up a socket with the namespace "connection" for new sockets
var android_nsp = io.of("/android-app");
android_nsp.on("connection", socket => {
  console.log("the Android client connected");

  //Here we listen on a new namespace called "incoming data"
  socket.on("sensor_data_for_server", data => {
    if (clients["web"]) {
      clients["web"].emit("sensor_data_for_web_client", JSON.parse(data));
    }
  });

  //A special namespace "disconnect" for when a client disconnects
  socket.on("disconnect", () => console.log("the Android client disconnected"));
  clients["anroid"] = socket;
  clients["anroid"].emit("sensor request", "acc", "start");
});

var web_nsp = io.of("/web-app");
web_nsp.on("connection", socket => {
  console.log("the web client connected");
  socket.on("disconnect", () => console.log("the web client disconnected"));
  clients["web"] = socket;
});

server.listen(port, () => console.log(`Listening on port ${port}`));
