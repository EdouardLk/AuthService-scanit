const express = require('express');
const router = express.Router();
const userController = require('../../controllers/googleAuth/user.controller');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const JWT_SECRET = process.env.JWT_SECRET;

require('dotenv').config();


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/google/auth/callback'
}, (accessToken, refreshToken, profile, done) => {
  const user = {
    id: profile.id,
    name: profile.displayName,
    email: profile.emails?.[0]?.value
  };
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, (payload, done) => {
  if (payload) return done(null, payload);
  return done(null, false);
}));




//routes-----------

router.get('/auth', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/auth/callback' ,passport.authenticate('google', { session: false }) , userController.googleCallback);

router.get('/protected',userController.googleProtected);

router.post('/verifyToken', (req, res) => { // méthode à la racine pour checker la validité des tokens généré par google
  console.log(req.headers);
  const token = req.headers.authorization;
  if (!token) return res.status(400).json({ message: 'Token manquant' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    res.status(200).json({ user: decoded });
  } catch (err) {
    res.status(403).json({ message: 'Token invalide ou expiré' });
  }
});

module.exports = router;
