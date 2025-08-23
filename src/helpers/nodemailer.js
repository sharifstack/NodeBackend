require("dotenv").config();
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: process.env.NODE_ENV == "development" ? false : true,
  auth: {
    user: process.env.HOST_MAIL,
    pass: process.env.HOST_APP_PASSWORD,
  },
});

//------Sending mail to Registered user------//
exports.sendMail = async (email, subject, template) => {
  const info = await transporter.sendMail({
    from: "Sharif Dev",
    to: email,
    subject: subject,
    text: "Confirm Registration",
    html: template,
  });

  console.log("Message sent:", info.messageId);
  return info.messageId;
};

//--------make otp--------//
exports.Otp = () => {
  return crypto.randomInt(1000, 9999);
};
