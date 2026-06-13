const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email send error: ${error.message}`);
    throw new Error('Email could not be sent');
  }
};

const passwordResetEmailTemplate = (name, resetUrl) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Password Reset</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 10px; text-align: center;">
    <h1 style="color: #f59e0b; margin: 0;">🏍️ BikeRental</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333;">Password Reset Request</h2>
    <p style="color: #666;">Hello <strong>${name}</strong>,</p>
    <p style="color: #666;">You requested a password reset. Click the button below to reset your password. This link expires in <strong>10 minutes</strong>.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: #f59e0b; color: #fff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
    </div>
    <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email. Your password will not change.</p>
    <hr style="border: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">© 2024 BikeRental. All rights reserved.</p>
  </div>
</body>
</html>
`;

module.exports = { sendEmail, passwordResetEmailTemplate };
