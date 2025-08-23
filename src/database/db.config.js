require("dotenv").config();
const mongoose = require("mongoose");
const DBName = require("../constants/constants");
exports.ConnectDatabase = async () => {
  try {
    const db = await mongoose.connect(`${process.env.MONGODB_URL}/node`);
    console.log("Database connection sucessfully......", db.connection.host);
  } catch (error) {
    console.log("Error from Database Connection", error);
  }
};
