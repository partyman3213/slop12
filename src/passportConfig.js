import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import db from './db.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3500/auth/google/callback" // Where Google redirects after login
  },
  function(accessToken, refreshToken, profile, done) {
    try {
      // 1. Check if user already exists
      const getUser = db.prepare('SELECT * FROM users WHERE google_id = ?');
      let user = getUser.get(profile.id);

      // 2. If they don't exist, create them (they automatically get 10 credits from our DB default)
      if (!user) {
        const insertUser = db.prepare('INSERT INTO users (username, google_id) VALUES (?, ?)');
        // We use their Google display name or email as the username
        const result = insertUser.run(profile.displayName || profile.emails[0].value, profile.id);
        
        user = {
            id: result.lastInsertRowid,
            username: profile.displayName,
            google_id: profile.id,
            credits: 10
        };
      }
      
      // Pass the user to Passport to finish logging in
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serialize: What to save in the session (just the ID to save space)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize: Turning the ID back into a full user object on every request
passport.deserializeUser((id, done) => {
  try {
    const getUser = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = getUser.get(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});