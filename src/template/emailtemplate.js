exports.RegistrationTemplate = (
  name,
  email,
  verifyEmailLink,
  otp,
  expireTime
) => {
  return `
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Email Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background-color: #f44336;
      text-align: center;
      padding: 30px 20px;
    }
    .header img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
    }
    .content {
      padding: 30px;
      text-align: center;
    }
    .content h2 {
      margin: 0 0 20px;
      font-size: 22px;
      color: #333333;
    }
    .content p {
      font-size: 15px;
      line-height: 1.6;
      color: #555555;
      margin: 0 0 25px;
    }
    .otp-box {
      display: inline-block;
      background: #f44336;
      color: #fff;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 3px;
      margin: 15px 0;
    }
    .btn {
      display: inline-block;
      background-color: #f44336;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 4px;
      font-size: 15px;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 13px;
      color: #777777;
      background-color: #fafafa;
      border-top: 1px solid #eeeeee;
    }
    .social-icons img {
      width: 22px;
      margin: 0 6px;
    }
  </style>
</head>
<body>

  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="https://via.placeholder.com/60" alt="Logo">
    </div>

    <!-- Content -->
    <div class="content">
      <h2>Email Verification</h2>
      <p>
        Hi <strong>${name}</strong>, <br><br>
        Thanks for registering with us using <strong>${email}</strong>. <br>
        To complete your registration, please verify your email address. <br><br>
        <strong>Your OTP:</strong>
      </p>

      <!-- OTP -->
      <div class="otp-box">${otp}</div>

      <p>
        Or click the button below to verify your email:
      </p>

      <a href="${verifyEmailLink}" class="btn">Verify my email address</a>

      <p style="margin-top:20px; font-size:13px; color:#777;">
        ⚠️ This link/OTP will expire in <strong>${new Date(
          expireTime
        )}</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="social-icons">
        <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook"></a>
        <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="LinkedIn"></a>
        <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733614.png" alt="Instagram"></a>
      </div>
      <p>800 Broadway Suite 1500 New York, NY 000423, USA</p>
      <p><a href="#">Privacy Policy</a> | <a href="#">Contact</a></p>
    </div>
  </div>

</body>
</html>
`;
};
exports.resendOtpTemplate = (name, email, otp, expireTime) => {
  return `
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resend Otp</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background-color: #f44336;
      text-align: center;
      padding: 30px 20px;
    }
    .header img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
    }
    .content {
      padding: 30px;
      text-align: center;
    }
    .content h2 {
      margin: 0 0 20px;
      font-size: 22px;
      color: #333333;
    }
    .content p {
      font-size: 15px;
      line-height: 1.6;
      color: #555555;
      margin: 0 0 25px;
    }
    .otp-box {
      display: inline-block;
      background: #f44336;
      color: #fff;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 3px;
      margin: 15px 0;
    }
    .btn {
      display: inline-block;
      background-color: #f44336;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 4px;
      font-size: 15px;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 13px;
      color: #777777;
      background-color: #fafafa;
      border-top: 1px solid #eeeeee;
    }
    .social-icons img {
      width: 22px;
      margin: 0 6px;
    }
  </style>
</head>
<body>

  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="https://via.placeholder.com/60" alt="Logo">
    </div>

    <!-- Content -->
    <div class="content">
      <h2>Email Verification</h2>
      <p>
        Hi <strong>${name}</strong>, <br><br>
        Thanks for registering with us using <strong>${email}</strong>. <br>
        To complete your registration, please verify your email address. <br><br>
        <strong>Your OTP:</strong>
      </p>

      <!-- OTP -->
      <div class="otp-box">${otp}</div>

      <p>
        Or click the button below to verify your email:
      </p>


      <p style="margin-top:20px; font-size:13px; color:#777;">
        ⚠️ This link/OTP will expire in <strong>${new Date(
          expireTime
        )}</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="social-icons">
        <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook"></a>
        <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="LinkedIn"></a>
        <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733614.png" alt="Instagram"></a>
      </div>
      <p>800 Broadway Suite 1500 New York, NY 000423, USA</p>
      <p><a href="#">Privacy Policy</a> | <a href="#">Contact</a></p>
    </div>
  </div>

</body>
</html>
`;
};
