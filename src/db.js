import { DatabaseSync } from 'node:sqlite'
const db = new DatabaseSync('./members.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT, /* Kept for your old local login, can be null */
    google_id TEXT UNIQUE, /* Stores the unique ID from Google */
    credits INTEGER DEFAULT 10 /* Grants 10 credits by default */
  )
`);

// Duomenų įrašymas (naudojant prepared statements saugumui)

// Duomenų nuskaitymas
//db.exec('DELETE FROM users WHERE id = 1');


export default db