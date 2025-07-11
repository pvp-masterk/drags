import fetch from 'node-fetch';

const { SUPABASE_URL, SUPABASE_KEY, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI } = process.env;

async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  // Exchange code for access token
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: DISCORD_REDIRECT_URI,
    scope: 'identify'
  });
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    body: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  const { access_token } = await tokenRes.json();

  // Fetch user info
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const discordUser = await userRes.json();

  // Upsert into Supabase
  await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      discord_id: discordUser.id,
      username: discordUser.username + '#' + discordUser.discriminator,
      avatar_url: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
      online: true
    })
  });

  // Set cookie / session and redirect to profile
  res.redirect(`/profile.html?discord_id=${discordUser.id}`);
}

export default handler;
