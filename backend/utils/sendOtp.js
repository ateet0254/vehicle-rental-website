// sendOtp.js
const nodemailer = require("nodemailer");

const sendOtp = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: `"RentARide" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "🔐 OTP for Password Reset - RentARide",
      html: `
        <h2>🛡️ OTP Verification</h2>
        <p>Use the following One-Time Password (OTP) to reset your RentARide account password:</p>
        <h1 style="color: #2c3e50;">${otp}</h1>
        <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
        <p>Regards,<br>Team RentARide 🚗</p>
      `
    };

    await transporter.sendMail(mailOptions);
    // console.log(`📧 OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    throw error;
  }
};

module.exports = sendOtp;
