import db from './db.js';

try {
    // We update the credits to 100 where the username is 'Rexing'
    const updateQuery = db.prepare("UPDATE users SET credits = 20 WHERE username = 'Augia So'");
    updateQuery.run();
    console.log("Success! You now have 20 credits.");
} catch (error) {
    console.error("Error updating credits:", error.message);
}

