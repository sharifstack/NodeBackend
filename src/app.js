const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const { globalErrorHandler } = require("../utils/globalErrorHandler");
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
module.exports = { app };
