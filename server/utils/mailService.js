const { Resend } = require('resend');

// Initialize Resend with API Key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailOTP = async (email, otp, customerName = 'Customer') => {
  try {
    // If no API key or placeholder is used, fallback to development mode
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
      console.warn('!!! VALID RESEND_API_KEY MISSING: Falling back to Development Mode !!!');
      console.log('Please add your real Resend API Key to the .env file.');
      console.log(`To: ${email} | OTP: ${otp} | Customer: ${customerName}`);
      return { success: true, devOtp: otp };
    }

    console.log(`Attempting to send email to ${email} via Resend API`);

    const { data, error } = await resend.emails.send({
      // NOTE: Using support@ instead of noreply@ for better deliverability
      // If domain is not yet verified in Resend dashboard, this might need to stay as onboarding@resend.dev
      from: 'NiraaCare <support@niraacare.com>',
      to: email,
      subject: 'Your OTP Code 🔐',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OTP Verification</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f6f6f6; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">Niraa Care</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 25px; text-align: center;">
              <h3 style="margin-top: 0;">Verify Your Account 🔐</h3>
              <p>Hi ${customerName},</p>
              <p>Use the One-Time Password (OTP) below to complete your verification:</p>

              <!-- OTP Box -->
              <div style="margin: 25px 0; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #2563eb;">
                ${otp}
              </div>

              <p>This OTP is valid for <strong>5 minutes</strong>.</p>

              <!-- Trust Signals -->
              <div style="margin-top: 25px; padding: 15px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 6px; font-size: 14px; color: #854d0e;">
                <p style="margin: 0;"><strong>Security Note:</strong> Do not share this OTP with anyone. NiraaCare will never ask for your OTP over phone or email.</p>
              </div>

              <p style="margin-top: 20px;">
                If you didn’t request this, you can safely ignore this email.
              </p>

              <p style="margin-top: 20px;">
                Thanks,<br><strong>Niraa Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f1f5f9; text-align: center; padding: 15px; font-size: 12px; color: #6b7280;">
              © 2026 Niraa Care. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
