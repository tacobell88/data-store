const nodemailer = require("nodemailer");
const dotEnv = require("dotenv");
const catchASyncError = require("../middlewares/catchASyncError");

dotEnv.config({
  path: "../config/config.env",
});

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAILUSER,
    pass: process.env.MAILPASS,
  },
});

exports.mailTester = catchASyncError(async (recipient, subject, body) => {
  const mailOptions = {
    from: "your_email@gmail.com",
    to: recipient,
    subject: subject,
    text: body,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
});
