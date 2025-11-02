const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const { globalErrorHandler } = require("../utils/globalErrorHandler");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();

//==make a json to object
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//==routes
app.use("/api/v1", require("./routes/index.api"));

//==global error handler
app.use(globalErrorHandler);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: "*",
});

io.on("connection", (socket) => {
  console.log(socket);
});

io.on("disconeted", (socket) => {
  console.log(socket);
});

module.exports = { httpServer };
