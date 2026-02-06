const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const { globalErrorHandler } = require("../utils/globalErrorHandler");
const { createServer } = require("http");
const { initsocketIO } = require("./socket-io/server");
const app = express();
const httpServer = createServer(app);

//==make a json to object
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://admin-dashboard-seven-alpha.vercel.app",
    ],

    credentials: true,
  }),
);

//==routes
app.use("/api/v1", require("./routes/index.api"));

//==global error handler
app.use(globalErrorHandler);
//socket-io
initsocketIO(httpServer);
//socket-io
module.exports = { httpServer };
