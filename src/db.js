import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 1. Sužinome, kur tiksliai sistemoje yra šis db.js failas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Nurodome absoliutų kelią į members.db, kuris yra vienu aplanku aukščiau (pagrindiniame aplanke)
const dbPath = path.resolve(__dirname, '../members.db');

// 3. Atidarome bazę naudodami tikslų kelią
const db = new DatabaseSync(dbPath);

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