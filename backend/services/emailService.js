const nodemailer = require('nodemailer');

// Configure email transporter (using Gmail as example - FREE)
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_APP_PASSWORD
//     }
// });

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },
    family: 4, // FORCE IPv4 - THIS FIXES THE ISSUE
    connectionTimeout: 10000,
    socketTimeout: 10000
});


// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email service is ready to send OTPs');
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (userEmail, otp) => {
    const mailOptions = {
        from: `"ByteBin" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Your Verification Code - ByteBin',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ByteBin</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          
          <div style="background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 1px solid #e0e0e0;">
            <div style="font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #667eea;">
              ${otp}
            </div>
          </div>
          
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        
        <div style="padding: 20px; text-align: center; background: #f0f0f0; font-size: 12px; color: #999;">
          <p>ByteBin - Problem Tracking Platform</p>
        </div>
      </div>
    `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${userEmail}`);
};

module.exports = { generateOTP, sendOTPEmail };


// Twilio SendGrid, Mailgun (Sinch), Twilio Verify (with SendGrid)