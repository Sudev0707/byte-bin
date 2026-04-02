const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: [true, 'Username is required'], unique: true, trim: true, minlength: [3, 'Username must be at least 3 characters long'], maxlength: [30, 'Username cannot exceed 30 characters'] },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'] },
  password: { type: String, required: true, minlength: [6, 'Password must be at least 6 characters long'], select: false },
  avatar: { type: String, default: "" },
  sharedProblems: [{ problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problems' }, sharedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, sharedAt: { type: String, default: () => new Date().toISOString().split('T')[0] }, permission: { type: String, enum: ['read', 'write'], default: 'read' } }],
  receivedProblems: [{ problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problems' }, sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, sharedAt: { type: String, default: () => new Date().toISOString().split('T')[0] }, permission: { type: String, enum: ['read', 'write'], default: 'read' } }],
  dateJoined: { type: String, default: () => new Date().toISOString().split('T')[0] },

}, { timestamps: true })

// Create text index for search functionality
userSchema.index({ username: 'text', email: 'text' });

userSchema.index({username: 1 }, { unique: true });
userSchema.index({email: 1 }, { unique: true });

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
