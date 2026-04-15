const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: [true, 'Username is required'], unique: true, trim: true, minlength: [3, 'Username must be at least 3 characters long'], maxlength: [30, 'Username cannot exceed 30 characters'] },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'] },
  password: {
    type: String, required: function () {
      return !this.googleId && !this.githubId;
    }, minlength: [6, 'Password must be at least 6 characters long'], select: false
  },
  isVerified: {
    type: Boolean, default: function () {
      return !!(this.googleId || this.githubId);
    }
  },
  lastLogin: { type: Date, default: Date.now },
  avatar: { type: String, default: "" },
  googleId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },
  provider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
  name: { type: String, default: "" },
  sharedProblems: [{ problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problems' }, sharedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, sharedAt: { type: String, default: () => new Date().toISOString().split('T')[0] }, permission: { type: String, enum: ['read', 'write'], default: 'read' } }],
  receivedProblems: [{ problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problems' }, sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, sharedAt: { type: String, default: () => new Date().toISOString().split('T')[0] }, permission: { type: String, enum: ['read', 'write'], default: 'read' } }],
  dateJoined: { type: Date, default: () => new Date().toISOString().split('T')[0] },
}, { timestamps: true });

// Create text index for search functionality
userSchema.index({ username: 'text', email: 'text', provider: 'text' });

// userSchema.pre('save', async function (next) {

//   if (this.googleId || this.githubId) {
//     console.log('Skipping password hash for social user:', this.email);
//     return next();
//   }

//   if (!this.password || !this.isModified('password')) {
//     return next();
//   }

//    try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next(); 
//   } catch (error) {
//     next(error); 
//   }
// });

userSchema.pre('save', async function() {
  if (this.googleId || this.githubId) return;

  if (!this.password || !this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate username from email if not provided (OAuth-safe)
userSchema.pre('validate', async function() {
  if (!this.username && this.email) {
   this.username = this.email.split('@')[0] + Date.now();
  }
});


module.exports = mongoose.model("User", userSchema);