const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const { globalErrorHandler } = require("../utils/globalErrorHandler");
const { createServer } = require("http");
const { initsocketIO } = require("./socket-io/server");
const app = express();

//==make a json to object
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const httpServer = createServer(app);

//==routes
app.use("/api/v1", require("./routes/index.api"));

//==global error handler
app.use(globalErrorHandler);

initsocketIO(httpServer);
module.exports = { httpServer };
