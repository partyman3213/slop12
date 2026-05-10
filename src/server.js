import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'
import appRoutes from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import session from 'express-session'; // NEW
import passport from 'passport'; // NEW
import './passportConfig.js'; // NEW: We will create this file next

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT;



//app.use(cors());
app.use(express.json());

// ---  Session Setup ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'a_very_secret_string', 
  resave: false, 
  saveUninitialized: false, 
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000 // Session lasts for 24 hours
  }
}));

// --- NEW: Passport Initialization ---
app.use(passport.initialize());
app.use(passport.session()); // Plugs passport into the express-session

// Routes
app.use('/auth', authRoutes)


app.use('/api', apiRoutes)

//image gen part ?

 app.use("/generateImage", appRoutes)

// Add this AFTER all routes, once, globally
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Max 5MB.' });
    }
    if (err.message === 'Invalid file type') {
        return res.status(400).json({ error: 'Only JPEG, PNG, and WebP are allowed.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
});

//End


app.use(express.static(path.join(__dirname, '..', 'public'), {
    extensions: ['html']
}));

app.use((req, res) => {
  res.send("Nothing here :(");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


/*
Server: ....

*/