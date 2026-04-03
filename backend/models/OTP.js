
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  otp: { type: String, required: true },
  userData:{type: Object, required: true},
  purpose:{type: String, enum:['registration', 'password-reset', 'login'], default:'registration' },
  expiresAt: { type: Date, default: () => Date.now() + 10 * 60 * 1000 }, // 10 min
  attempts: { type: Number, default: 0, max: 5 },
},{timestamps: true});

// MongoDB automatically deletes expired documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);