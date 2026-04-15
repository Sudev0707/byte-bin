require('dotenv').config();
const { sendOTPEmail, generateOTP, testEmailConfig } = require('./services/emailService');

async function testEmail() {
    console.log('🧪 Testing Email Service...\n');
    
    // Test 1: Check configuration
    console.log('Test 1: Checking email configuration...');
    await testEmailConfig();
    
    // Test 2: Generate OTP
    console.log('\nTest 2: Generating OTP...');
    const otp = generateOTP();
    console.log(`Generated OTP: ${otp}`);
    
    // Test 3: Send actual email
    console.log('\nTest 3: Sending test email...');
    const testEmail = 'aryasudev7@gmail.com'; 
    
    const result = await sendOTPEmail(testEmail, otp);
    
    if (result.success) {
        console.log('✅ Email sent successfully!');
        console.log(`Check ${testEmail} for OTP: ${otp}`);
    } else {
        console.log('❌ Email failed:', result.message);
    }
}

// Run the test
testEmail();