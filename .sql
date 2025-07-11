CREATE TABLE users (
  discord_id TEXT PRIMARY KEY,
  verification_code TEXT,
  username TEXT,
  points INTEGER DEFAULT 0
);
