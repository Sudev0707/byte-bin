const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: [true, 'Username is required'], unique: true, trim: true, minlength: [3, 'Username must be at least 3 characters long'], maxlength: [30, 'Username cannot exceed 30 characters'] },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'] },
  password: { type: String, required: true, minlength: [6, 'Password must be at least 6 characters long'], select: false },
}, { timestamps: true })


// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  try {
    this.password = await bcrypt.hash(this.password, 12);
  } catch (error) {
    throw error;
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
}



module.exports = mongoose.model("User", userSchema);
