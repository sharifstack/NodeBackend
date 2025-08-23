const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const UserModel = require("../models/user.model");
const { validateUser } = require("../validation/user.validation");
const { Otp, sendMail } = require("../helpers/nodemailer");
const {
  RegistrationTemplate,
  resendOtpTemplate,
} = require("../template/emailtemplate");
const { sendSMS } = require("../helpers/sms");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

exports.Registration = asyncHandler(async (req, res) => {
  const value = await validateUser(req);

  //save the user into database
  const user = await new UserModel({
    name: value.name,
    email: value.email || null,
    password: value.password,
    phoneNumber: value.phoneNumber || null,
  }).save();

  if (!user) {
    throw new customError(
      500,
      "User registration failed. Please try again later."
    );
  }

  //Confirm registration mail
  const verifyEmailLink = `www.frontend.com/verify-account/${user.email}`;
  const otp = Otp();
  const expireTime = Date.now() + 2 * 60 * 1000;
  user.resetPasswordOtp = otp;
  user.resetPasswordExpeires = expireTime;
  const template = RegistrationTemplate(
    user.name,
    user.email,
    verifyEmailLink,
    otp,
    expireTime
  );

  const result = await sendMail(user.email, "Verify your email 🦆", template);
  //send mail
  if (!result) {
    throw new customError(500, "Failed to send verification email.");
  } else {
    const verifyEmailLink = `www.frontend.com/verify-account/${user.phoneNumber}`;
    const smsBody = `Hi ${user.name},
Your OTP is: ${otp}.  
Verify your account by clicking the link: ${verifyEmailLink}.
This code will expire in ${new Date(expireTime).getMinutes()} minutes.`;
    const sms = await sendSMS(user.phoneNumber, smsBody);
    console.log(sms);

    // if (sms?.data?.response_code !== 202) {
    //   throw new customError(
    //     500,
    //     "Failed to send SMS verification.",
    //     sms?.error_message
    //   );
    // }
  }
  await user.save();
  apiResponse.sendsuccess(res, 201, "Registration successful", {
    name: user.name,
  });
});

//--------Verify phone number And Email----------//
exports.verifyuser = asyncHandler(async (req, res) => {
  const { email, otp, phoneNumber } = req.body;
  if (!otp) {
    throw new customError(401, "Otp Missing");
  }

  //--Find the otp into database and verify Otp--//
  const validuser = await UserModel.findOne({
    email: email,
    phoneNumber: phoneNumber,
  });

  if (!validuser) {
    throw new customError(401, "User Not Found");
  }
  if (
    phoneNumber &&
    validuser.resetPasswordOtp == otp &&
    validuser.resetPasswordExpeires > Date.now()
  ) {
    validuser.PhoneNumberVerified = true;
    validuser.isActive = true;
    validuser.resetPasswordExpeires = null;
    validuser.resetPasswordOtp = null;
    await validuser.save();
  }

  if (
    phoneNumber &&
    validuser.resetPasswordOtp == otp &&
    validuser.resetPasswordExpeires > Date.now()
  ) {
    validuser.emailVerified = true;
    validuser.isActive = true;
    validuser.resetPasswordExpeires = null;
    validuser.resetPasswordOtp = null;
    await validuser.save();
  }
  apiResponse.sendsuccess(
    res,
    200,
    "Your Otp matched, Your account has been verified ",
    { user: validuser.email }
  );
});

//-----Resend Otp-----//
exports.resendOtp = asyncHandler(async (req, res) => {
  const { email, phoneNumber } = req.body;
  const user = await UserModel.findOne({
    email: email,
    phoneNumber: phoneNumber,
  });
  const otp = Otp();
  const expireTime = Date.now() + 2 * 60 * 1000;
  // --Resend Otp via Email--//
  if (email) {
    const template = resendOtpTemplate(user.name, user.email, otp, expireTime);
    await sendMail(user.email, "Resend Otp 🧑‍🔧", template);
    user.resetPasswordExpeires = expireTime;
    user.resetPasswordOtp = otp;
    await user.save();
  }
  //--Resend Otp via Phone-Number--//
  if (phoneNumber) {
    const smsBody = `Hi ${user.name},
Your OTP is: ${otp}.
This code will expire in ${new Date(expireTime).getMinutes()} minutes.
Need help?
Contact:01403876678`;
    const sms = await sendSMS(user.phoneNumber, smsBody);
    console.log(sms);

    // if (sms?.data?.response_code !== 202) {
    //   throw new customError(
    //     500,
    //     "Failed to send SMS verification.",
    //     sms?.error_message
    //   );
    // }
    user.resetPasswordExpeires = expireTime;
    user.resetPasswordOtp = otp;
    await user.save();
  }
  apiResponse.sendsuccess(
    res,
    200,
    "Your Otp send Successfully. Check Your Email or Phone-Number",
    null
  );
});

//----Forgot Password----//
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new customError(401, "Email Is Missing");
  }
  const user = await UserModel.findOne({ email });
  if (!user)
    throw new customError(
      401,
      "This Email Is Not Registrated, Please Complete The Registration Process First. "
    );
  //---Sending Email to the user---//
  return res
    .status(301)
    .redirect(`https://www.udemy.com/career/full-stack-web-developer/`);
});

//----Reset Password----//
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  const pattern =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!newPassword && !confirmPassword)
    throw new customError(401, "New Password or Confirm Password is Missing");
  if (!pattern.test(newPassword))
    throw new customError(
      401,
      "Password must be at least 8 characters long and include one uppercase letter, one number, and one special character."
    );

  if (newPassword !== confirmPassword)
    throw new customError(401, "Password doesn’t match.");
  const user = await userModel.findOne({ email });
  if (!user) throw new customError(401, "User Not Found");
  user.password = newPassword;
  await user.save();
  return res
    .status(301)
    .redirect("https://www.udemy.com/career/digital-marketer/");
});

//-----Login----//
exports.login = asyncHandler(async (req, res) => {
  const { phoneNumber, email, password } = req.body;
  if (phoneNumber == undefined && email == undefined)
    throw new customError(401, "PhoneNumber or Email Missing");
  //----search the user in the database-----//
  const user = await userModel.findOne({ phoneNumber, email });
  if (!user) throw new customError(401, "User Not Found");

  //----Checking The password-----/
  const passwordRight = await user.comparePassword(password);
  if (!passwordRight) throw new customError(401, "email or password incorrect");

  //----Generate AccessToken And RefreshToken----/
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV == "development" ? false : true,
    samesite: "none",
    path: "/",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  //------Saving The RefreshToken Into database------//
  user.refreshToken = refreshToken;
  await user.save();
  apiResponse.sendsuccess(res, 201, "Login Successful", {
    accessToken: accessToken,
    userName: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
  });
});

//---------LogOut---------//
exports.logout = asyncHandler(async (req, res) => {
  const token = req?.body?.token || req.headers?.authorization;
  const { userid } = await jwt.verify(token, process.env.ACCESSTOKEN_SECRET);
  //----Find the user---//
  const user = await userModel.findById(userid);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV == "development" ? false : true,
    samesite: "none",
    path: "/",
  });
  user.refreshToken = null;
  await user.save();
  apiResponse.sendsuccess(res, 200, "Logout Successful", { user });
});
