const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

// client-side
socket.on("connect", () => {
  console.log("client has been connected to the server", socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("disconnect", () => {
  console.log("client has been disconected to the server", socket.id); // undefined
});
