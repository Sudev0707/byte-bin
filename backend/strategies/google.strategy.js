const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL ,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ 
        $or: [
          { email: profile.emails[0]?.value },
          { googleId: profile.id }
        ]
      });
      
      if (!user) {
        // Create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0]?.value,
          username: profile.displayName || profile.emails[0]?.value.split('@')[0],
          name: profile.displayName,
          avatar: profile.photos[0]?.value,
          isVerified: true,
          provider: 'google',
          lastLogin: new Date()
        });
      } else if (!user.googleId) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.provider = 'google';
        user.lastLogin = new Date();
        await user.save();
      } else {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
      }
      
      return done(null, user);
    } catch (err) {
      console.error('Google OAuth Error:', err);
      return done(err, null);
    }
  }
));