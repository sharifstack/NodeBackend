require("dotenv").config();
const axios = require("axios");

exports.sendSMS = async (phoneNumber, smsBody) => {
  try {
    const response = await axios.post(process.env.API_URL, {
      api_key: process.env.API_KEY,
      sender_id: process.env.SENDER_ID,
      number: Array.isArray(phoneNumber) ? phoneNumber.join(",") : phoneNumber,
      message: smsBody,
    });
    console.log(response);
  } catch (error) {
    console.log("Error sending sms", error); 
  }
};
