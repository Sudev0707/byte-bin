const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error("Google account has no email"), null);
      }

      let user = await User.findOne({
        $or: [
          { email },
          { googleId: profile.id }
        ]
      });


      if (!user) {
        const baseUsername = profile.displayName || email.split('@')[0];

        const userData = {
          googleId: profile.id,
          email,
          username: baseUsername + "_" + Math.floor(Math.random() * 1000),
          name: profile.displayName,
          avatar: profile.photos[0]?.value,
          isVerified: true,
          provider: 'google',
          lastLogin: new Date()
        };

        user = new User(userData);
      }
      else if (!user.googleId) {
        user.googleId = profile.id;
        user.provider = 'google';

      }
      user.lastLogin = new Date();
      await user.save();

      return done(null, user);
    } catch (err) {
      console.error('Google OAuth Error:', err);
      return done(err, null);
    }
  }
));