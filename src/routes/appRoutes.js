import express from "express";
import multer from "multer";
import db from "../db.js";
import rateLimit from "express-rate-limit";
import { InferenceClient } from "@huggingface/inference";

const router = express.Router();

const hf = new InferenceClient(process.env.HF_TOKEN);



const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 1,                   // only 1 file
    },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('Invalid file type'), false);
        }
        cb(null, true);
    }
});



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

router.post('/', isAuthenticated, imageLimiter, upload.single("image"), async (req, res) => {
    
    
try {
        // ATOMIC OPERATION: Check credits AND deduct in a single query
        // This prevents race conditions where multiple requests could slip through
        const deductCredit = db.prepare(
            'UPDATE users SET credits = credits - 2 WHERE id = ? AND credits > 0'
        );
        const result = deductCredit.run(req.user.id);

        // If no rows were affected, user had 0 credits
        if (result.changes === 0) {
            return res.status(403).json({ error: "Out of credits! Please top up." });
        }

        // Do your expensive operation (e.g., Image Generation )
     const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: "Prompt is required" });
    }   

    if (prompt.length < 0 || prompt.length > 400) {
    return res.status(400).json({ error: "Prompt must be 0-100 characters" });
   }

 // Sanitize to prevent prompt injection
 const cleanPrompt = prompt.trim().substring(0, 400);
 if (!req.file) {
    return res.status(400).json({ error: "An image is required." });
}
 const inputBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

    

    const response = await hf.imageToImage({
      model: "black-forest-labs/FLUX.2-klein-4B",
      provider: "replicate",
      inputs: inputBlob,
      parameters: {
      prompt: cleanPrompt,
       
      },
    });

        // Get binary image
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Get credits from DB
        const getUser = db.prepare("SELECT credits FROM users WHERE id = ?");
        const updatedUser = getUser.get(req.user.id);

        // Send back to client
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('X-Remaining-Credits', updatedUser.credits);
        res.send(buffer);

} catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;