import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL, // Your Gmail address
    pass: process.env.SMTP_PASSWORD, // Your App Password
  },
});

export const sendOTP = async (to: string, otp: string) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn("[Email Warning] SMTP_EMAIL or SMTP_PASSWORD is not set in .env.");
    console.log(`[Email Mock] Would have sent OTP ${otp} to ${to}`);
    return false;
  }

  const mailOptions = {
    from: `"Simi Cafe" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Your Simi Cafe Verification Code',
    html: `
      <div style="font-family: sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #2F4F4F;">Welcome to Simi Cafe! ☕</h2>
        <p>Please use the following 6-digit code to verify your account creation.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #d97706; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Success] OTP sent to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send email to ${to}:`, error);
    return false;
  }
};
