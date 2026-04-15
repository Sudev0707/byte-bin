const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ 
        $or: [
          { email: profile.emails?.[0]?.value },
          { githubId: profile.id }
        ]
      });
      
      if (!user) {
        // Create new user
        user = await User.create({
          githubId: profile.id,
          email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
          username: profile.username,
          name: profile.displayName || profile.username,
          avatar: profile.photos?.[0]?.value,
          isVerified: true,
          provider: 'github',
          lastLogin: new Date()
        });
      } else if (!user.githubId) {
        // Link GitHub account to existing user
        user.githubId = profile.id;
        user.provider = 'github';
        user.lastLogin = new Date();
        await user.save();
      } else {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
      }
      
      return done(null, user);
    } catch (err) {
      console.error('GitHub OAuth Error:', err);
      return done(err, null);
    }
  }
));