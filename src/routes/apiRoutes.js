import express from 'express';
import db from '../db.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Middleware to protect routes 
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "You must be logged in to do this." });
}

const imageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15, // 5 requests per minute per user
    keyGenerator: (req) => req.user.id, // Per-user limit
    message: "Too many requests. Try again later.",
});

router.get('/user-stats', isAuthenticated, async (req, res) => {

    try {
        // Now req.user is guaranteed to exist
        const user = db.prepare("SELECT credits FROM users WHERE id = ?").get(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ credits: user.credits });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }

});

export default router;