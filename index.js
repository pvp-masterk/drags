const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const cors = require("cors");

const app = express();

// 🔧 Replace with your actual credentials from Discord Developer Portal
const CLIENT_ID = '1392907277463457792';
const CLIENT_SECRET = 'SqXNNTdjVOzeBFQ7RmtemwKUbl5zY0FX';
const CALLBACK_URL = 'http://localhost:3000/auth/discord/callback';
const SESSION_SECRET = 'someSuperSecretSessionKey';

app.use(cors({
  origin: "http://localhost:5500", // Frontend origin
  credentials: true
}));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
  scope: ['identify']
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => done(null, profile));
}));

app.get("/auth/discord", passport.authenticate("discord"));

app.get("/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => res.redirect("http://localhost:5500")
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("http://localhost:5500");
  });
});

app.get("/user", (req, res) => {
  res.json(req.user || {});
});

app.listen(3000, () => {
  console.log("✅ Auth server running at http://localhost:3000");
});
