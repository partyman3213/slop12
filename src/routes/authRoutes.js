import express from 'express';
import passport from 'passport';

const router = express.Router();

// 1. Send the user to Google to log in
// We ask for the 'profile' and 'email' scopes here.
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);

// 2. Google sends the user back here after they approve
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication!
    // req.user is now populated with the user's database row.
    res.redirect('/?login=success'); // Redirect them to your main app page
  }
);

// 3. Simple logout route
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

export default router;