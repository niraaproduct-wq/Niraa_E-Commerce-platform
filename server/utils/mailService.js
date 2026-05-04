const nodemailer = require('nodemailer');

const sendEmailOTP = async (email, otp) => {
  try {
    // Note: These env variables should be added to your .env file
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"NIRAA Products" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Login OTP for NIRAA',
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e5e3de; border-radius: 12px;">
          <h2 style="color: #1D9E75; text-align: center;">NIRAA</h2>
          <p>Hello,</p>
          <p>Use the following OTP to verify your account and login to NIRAA Products. This OTP is valid for 5 minutes.</p>
          <div style="background: #f9f9f8; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #1A1917;">
            ${otp}
          </div>
          <p style="color: #87847C; font-size: 12px; margin-top: 20px;">
            If you did not request this OTP, please ignore this email.
          </p>
        </div>
      `,
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
      return { success: true };
    } else {
      console.log('--- DEVELOPMENT MODE: EMAIL OTP ---');
      console.log(`To: ${email}`);
      console.log(`OTP: ${otp}`);
      console.log('-----------------------------------');
      return { success: true, devOtp: otp };
    }
  } catch (error) {
    console.error('Send Email Error:', error);
    return { success: false, message: error.message };
  }
};

module.exports = { sendEmailOTP };
