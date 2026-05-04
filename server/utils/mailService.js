const nodemailer = require('nodemailer');

const sendEmailOTP = async (email, otp) => {
  try {
    // Note: These env variables should be added to your .env file
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      family: 4, // Force IPv4 only
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
      console.log(`Attempting to send email to ${email} using ${process.env.EMAIL_USER}`);
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully: ' + info.response);
        return { success: true };
      } catch (sendError) {
        console.error('Nodemailer sendMail error:', sendError);
        return { success: false, message: `Nodemailer error: ${sendError.message}` };
      }
    } else {
      console.warn('!!! EMAIL CONFIG MISSING: Falling back to Development Mode !!!');
      console.log('Ensure EMAIL_USER and EMAIL_PASS are set in .env');
      console.log(`To: ${email} | OTP: ${otp}`);
      return { success: true, devOtp: otp };
    }
  } catch (error) {
    console.error('Send Email Error:', error);
    return { success: false, message: error.message };
  }
};

module.exports = { sendEmailOTP };
