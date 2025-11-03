const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  query: { userId: "222" },
});

// client-side
socket.on("connect", () => {
  console.log("client has been connected to the server", socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("addToCart", (data) => {
  console.log("Received addToCart:", data);
});

socket.on("disconnect", () => {
  console.log("client has been disconected to the server", socket.id); // undefined
});
