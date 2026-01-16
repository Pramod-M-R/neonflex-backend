import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        role TEXT CHECK (role IN ('ADMIN', 'VIEWER')) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_asset_id TEXT NOT NULL,
  stream_type TEXT NOT NULL CHECK (stream_type IN ('youtube')),
  duration INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



      CREATE TABLE IF NOT EXISTS watch_progress (
        user_id UUID REFERENCES users(id),
        video_id UUID REFERENCES videos(id),
        last_watched_seconds INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, video_id)
      );
    `);

    console.log("🟢 Database tables ensured");
  } catch (err) {
    console.error("❌ Database init failed", err);
    throw err;
  }
}

pool.on("connect", () => {
  console.log("🟢 Connected to PostgreSQL");
});
