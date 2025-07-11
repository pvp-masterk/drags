// /api/verify.js
import { Client } from 'pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.body;

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  const result = await client.query(
    'SELECT * FROM users WHERE verification_code = $1',
    [code]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Code not found" });
  }

  const user = result.rows[0];

  return res.status(200).json({
    discord_id: user.discord_id,
    profile_data: {
      username: user.username || "Not set",
      points: user.points || 0
    }
  });
}
