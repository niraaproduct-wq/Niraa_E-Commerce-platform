/**
 * SMS Service for sending OTPs via various providers
 * 
 * Supported providers:
 * - Fast2SMS (India, affordable)
 * - MSG91 (India, enterprise)
 * - Twilio (Global, premium)
 * - TextLocal (India, reliable)
 * 
 * For development, it logs OTP to console.
 * For production, configure your preferred provider in .env
 */

const https = require('https');
const http = require('http');

// SMS Provider configuration from environment
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'development'; // development, fast2sms, msg91, twilio, textlocal

/**
 * Send OTP via SMS
 * @param {string} phone - Phone number (10 digits for India)
 * @param {string} otp - OTP to send
 * @param {string} message - Custom message (optional)
 * @returns {Promise<{success: boolean, message: string, provider: string}>}
 */
const sendSMS = async (phone, otp, message = null) => {
  const defaultMessage = `Your NIRAA verification code is: ${otp}. Valid for 3 minutes. Do not share this code with anyone.`;
  const smsMessage = message || defaultMessage;

  try {
    switch (SMS_PROVIDER) {
      case 'fast2sms':
        return await sendViaFast2SMS(phone, smsMessage, otp);
      
      case 'msg91':
        return await sendViaMSG91(phone, smsMessage, otp);
      
      case 'twilio':
        return await sendViaTwilio(phone, smsMessage, otp);
      
      case 'textlocal':
        return await sendViaTextLocal(phone, smsMessage, otp);
      
      default:
        // Development mode - log to console
        console.log(`\n📱 SMS OTP for ${phone}: ${otp}`);
        console.log(`   Message: ${smsMessage}\n`);
        return {
          success: true,
          message: 'OTP sent (development mode - check console)',
          provider: 'development',
          devOtp: otp
        };
    }
  } catch (error) {
    console.error('SMS Service Error:', error.message);
    return {
      success: false,
      message: `Failed to send SMS: ${error.message}`,
      provider: SMS_PROVIDER
    };
  }
};

/**
 * Fast2SMS Provider
 * Website: https://www.fast2sms.com/
 * Pricing: ~0.15 INR per SMS
 */
const sendViaFast2SMS = async (phone, message, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;
  
  if (!apiKey) {
    throw new Error('FAST2SMS_API_KEY not configured in .env');
  }

  // Format phone number for India (add 91 prefix)
  const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;

  const postData = `sender_id=FSTSMS&message=${encodeURIComponent(message)}&language=english&route=p&numbers=${formattedPhone}`;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.fast2sms.com',
      port: 443,
      path: '/dev2/push',
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.return) {
            resolve({
              success: true,
              message: 'OTP sent successfully via Fast2SMS',
              provider: 'fast2sms',
              devOtp: otp
            });
          } else {
            reject(new Error(response.message || 'Fast2SMS API error'));
          }
        } catch (e) {
          reject(new Error('Invalid response from Fast2SMS'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

/**
 * MSG91 Provider
 * Website: https://msg91.com/
 * Pricing: ~0.18 INR per SMS
 */
const sendViaMSG91 = async (phone, message, otp) => {
  const authKey = process.env.MSG91_AUTH_KEY;
  
  if (!authKey) {
    throw new Error('MSG91_AUTH_KEY not configured in .env');
  }

  // Format phone number for India
  const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;

  const postData = JSON.stringify({
    sender: 'NIRAA',
    route: 'otp',
    country: '91',
    sms: [
      {
        content: message,
        to: formattedPhone
      }
    ]
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.msg91.com',
      port: 443,
      path: '/api/v5/otp',
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.type === 'success') {
            resolve({
              success: true,
              message: 'OTP sent successfully via MSG91',
              provider: 'msg91',
              devOtp: otp
            });
          } else {
            reject(new Error(response.message || 'MSG91 API error'));
          }
        } catch (e) {
          reject(new Error('Invalid response from MSG91'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

/**
 * Twilio Provider
 * Website: https://www.twilio.com/
 * Pricing: ~$0.0075 per SMS (global)
 */
const sendViaTwilio = async (phone, message, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio credentials not configured in .env');
  }

  // Format phone number with country code
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const postData = `Body=${encodeURIComponent(message)}&From=${encodeURIComponent(fromNumber)}&To=${encodeURIComponent(formattedPhone)}`;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.sid) {
            resolve({
              success: true,
              message: 'OTP sent successfully via Twilio',
              provider: 'twilio',
              devOtp: otp
            });
          } else {
            reject(new Error(response.message || 'Twilio API error'));
          }
        } catch (e) {
          reject(new Error('Invalid response from Twilio'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

/**
 * TextLocal Provider
 * Website: https://www.textlocal.in/
 * Pricing: ~0.20 INR per SMS
 */
const sendViaTextLocal = async (phone, message, otp) => {
  const apiKey = process.env.TEXTLOCAL_API_KEY;
  
  if (!apiKey) {
    throw new Error('TEXTLOCAL_API_KEY not configured in .env');
  }

  // Format phone number for India
  const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;

  const url = `https://api.textlocal.in/send/?apikey=${encodeURIComponent(apiKey)}&numbers=${formattedPhone}&message=${encodeURIComponent(message)}&sender=NIRAA`;

  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status === 'success') {
            resolve({
              success: true,
              message: 'OTP sent successfully via TextLocal',
              provider: 'textlocal',
              devOtp: otp
            });
          } else {
            reject(new Error(response.errors?.[0]?.message || 'TextLocal API error'));
          }
        } catch (e) {
          reject(new Error('Invalid response from TextLocal'));
        }
      });
    });
  });
};

/**
 * Validate Indian phone number
 */
const validatePhone = (phone) => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid Indian number (10 digits, starts with 6-9)
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return cleaned;
  }
  
  // Check if it's already with country code
  if (cleaned.length === 12 && cleaned.startsWith('91') && /^[6-9]/.test(cleaned.substring(2))) {
    return cleaned.substring(2);
  }
  
  return null;
};

module.exports = {
  sendSMS,
  validatePhone,
  // Export individual providers for testing
  sendViaFast2SMS,
  sendViaMSG91,
  sendViaTwilio,
  sendViaTextLocal
};