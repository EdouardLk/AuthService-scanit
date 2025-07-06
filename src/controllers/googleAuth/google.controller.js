const passport = require('../../config/passport');

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.googleCallback = (req, res) => {
  passport.authenticate('google', { session: false }, (err, data) => {
    if (err) {
      return res.send(`
        <script>
          window.opener.postMessage({ error: '${err.message}' }, '${process.env.FRONT_END_URL}');
          window.close();
        </script>
      `);
    }

    if (!data || !data.token) {
      return res.send(`
        <script>
          window.opener.postMessage({ error: 'Authentification échouée' }, '${process.env.FRONT_END_URL}');
          window.close();
        </script>
      `);
    }

    // Envoyer le token au frontend via postMessage
    res.send(`
      <script>
        window.opener.postMessage({ token: '${data.token}' }, '${process.env.FRONT_END_URL}');
        window.close();
      </script>
    `);
  })(req, res);
}; 