const { customError } = require("../../utils/customError");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

exports.authGuard = async (req, res, next) => {
  const accessToken = req?.headers?.authorization
    ?.replace("Bearer ", " ")
    .trim();

  try {
    if (!accessToken) {
      throw new customError(401, "No token provided!");
    }
    let tokenValue;
    try {
      tokenValue = jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET);
      console.log(tokenValue);
    } catch (err) {
      console.log(" tokenValue catch", err);
      throw new customError(410, "Token invalid or expired");
    }
    const userinfo = await userModel.findById(tokenValue.userid);
    if (!userinfo) throw new customError(401, "User not found!");

    req.user = userinfo;
    next();
  } catch (error) {
    console.log(error);
    next(error); // send error to your global error handler
  }
};
