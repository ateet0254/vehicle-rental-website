// sendConfirmationEmail.js

const nodemailer = require("nodemailer");

const sendConfirmationEmail = async (email, booking) => {
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
      subject: "Booking Confirmation - RentARide",
      html: `
        <h2>✅ Payment Confirmed!</h2>
        <p>Thank you for booking with RentARide.</p>
        <p><strong>Vehicle:</strong> ${booking.vehicle?.name}</p>
        <p><strong>From:</strong> ${new Date(booking.startDateTime).toLocaleString()}</p>
        <p><strong>To:</strong> ${new Date(booking.endDateTime).toLocaleString()}</p>
        <p><strong>Status:</strong> Paid</p>
        <p>We hope you enjoy your ride! 🚗</p>
      `
    };
    // console.log("📧 Confirmation email sent to:", email);
    await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error("❌ Failed to send confirmation email:", error);
  }
};

module.exports = sendConfirmationEmail;
