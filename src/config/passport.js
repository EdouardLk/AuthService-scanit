const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Vérifier si l'utilisateur existe déjà dans la base de données
        const response = await fetch(`${process.env.DATABASE_SERVICE_URL}/users/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            googleId: profile.id,
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            userName: profile.displayName,
            role: 'user',
            tier: 'freemium'
          })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la création/récupération de l\'utilisateur');
        }

        const userData = await response.json();
        
        // Créer le token JWT
        const token = jwt.sign(
          {
            id: userData.user.id,
            email: userData.user.email,
            firstName: userData.user.firstName,
            lastName: userData.user.lastName,
            userName: userData.user.userName,
            role: userData.user.role,
            tier: userData.user.tier
          },
          process.env.JWT_SECRET,
          { expiresIn: '12h' }
        );

        return done(null, { user: userData.user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport; 