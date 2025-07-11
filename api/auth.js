export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  // Hardcoded values
  const DISCORD_CLIENT_ID = "1392907277463457792";
  const DISCORD_CLIENT_SECRET = "_WRYbVHti2pjmQTPKxXuf9Nk2NBYCDQ9";
  const DISCORD_REDIRECT_URI = "https://dragswebapp.vercel.app/api/auth";
  const SUPABASE_URL = "https://akektlyhqzbatuedgnuq.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrZWt0bHlocXpiYXR1ZWRnbnVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjUwNzUsImV4cCI6MjA2NzgwMTA3NX0.NqsB9Gj4_ZbZw9DgLiLxz2hwEyQvd7tCYy-drMbLGCg";

  // Step 1: Exchange code for access_token
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: DISCORD_REDIRECT_URI,
    scope: "identify",
  });

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: params,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const tokenData = await tokenRes.json();
  const access_token = tokenData.access_token;

  if (!access_token) {
    return res.status(400).json({ message: "Invalid token exchange" });
  }

  // Step 2: Get user info
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const discordUser = await userRes.json();

  // Step 3: Save to Supabase
  await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      discord_id: discordUser.id,
      username: discordUser.username + "#" + discordUser.discriminator,
     if discord_user["avatar"]:
    avatar_url = f"https://cdn.discordapp.com/avatars/{discord_user['id']}/{discord_user['avatar']}.png"
else:
    default_index = int(discord_user["discriminator"]) % 5  # Or any logic
    avatar_url = f"https://cdn.discordapp.com/embed/avatars/{default_index}.png"

      online: true,
    }),
  });
 


  // Step 4: Redirect to profile
  res.redirect(`/profile.html?discord_id=${discordUser.id}`);
}
