const { Resend } = require('resend');

// Initialize Resend with API Key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailOTP = async (email, otp) => {
  try {
    // If no API key or placeholder is used, fallback to development mode
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
      console.warn('!!! VALID RESEND_API_KEY MISSING: Falling back to Development Mode !!!');
      console.log('Please add your real Resend API Key to the .env file.');
      console.log(`To: ${email} | OTP: ${otp}`);
      return { success: true, devOtp: otp };
    }

    console.log(`Attempting to send email to ${email} via Resend API`);

    const { data, error } = await resend.emails.send({
      from: 'NIRAA <onboarding@resend.dev>', // Replace with your verified domain in production
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
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { success: false, message: `Resend error: ${error.message}` };
    }

    console.log('Email sent successfully via Resend:', data.id);
    return { success: true };

  } catch (error) {
    console.error('Send Email Error (Resend):', error);
    return { success: false, message: error.message };
  }
};

module.exports = { sendEmailOTP };
