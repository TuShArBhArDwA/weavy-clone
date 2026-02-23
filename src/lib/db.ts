import { Pool } from 'pg';

// 🔍 DEBUGGING: Print the URL to the server console
console.log("🔍 CONNECTION STRING:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);