//GoogleAuth

const jwt = require('jsonwebtoken');
const crypto = require('crypto');


require('dotenv').config();

exports.googleCallback = async (req, res) => {

  const googleUser = {
    firstName: req.user.name.split(' ')[0] || 'Google',
    lastName: req.user.name.split(' ').slice(1).join(' ') || 'User',
    userName: req.user.email.split('@')[0],
    email: req.user.email,
    password: crypto.randomBytes(12).toString('hex'), // authentification google pas besoin de réecricre me mdp
    phone: "0000000000",
    role: 'user',
    tier: 'freemium',
    isGoogleUser: true,
  };

  //console.log(googleUser);

  try {
    // Vérifie si l'utilisateur existe déjà
    const response = await fetch(`${process.env.DATABASE_SERVICE_URL}/users/byEmail/${encodeURIComponent(googleUser.email)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    //console.log("le statut est : " + response.status)

    if (response.status === 200) {
      //console.log('Utilisateur déjà existant dans DatabaseService');

      const token = jwt.sign(googleUser, process.env.JWT_SECRET, { expiresIn: '12h' });

      res.cookie('token', token, {
        httpOnly: false,        // Protège contre XSS
        secure: false,          // En production, mettre à true pour https
        sameSite: 'Lax',      // Ou 'Strict' selon ton cas
        maxAge: 43200000        // Durée en ms (12h)
      });
            
      res.send(`
              <html>
                <body>
                  <script>
                    // Envoi des infos au parent (frontend)
                    window.opener.postMessage({
                      status: "success",
                      token: "${token}",
                      message: "Utilisateur connecté"
                    }, "${process.env.FRONT_END_URL}"); 

                    window.close();
                  </script>
                  <p>Connexion réussie. Cette fenêtre va se fermer automatiquement...</p>
                </body>
              </html>
        `);

      //return res.status(200).json({ message: "Utilisateur connecté", token: token });
    } else if (response.status === 404) {
      // Si utilisateur non trouvé (404), on le crée
      try {
        const response = await fetch(`${process.env.DATABASE_SERVICE_URL}/users/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(googleUser)
        });

        if (response.status === 201) {
          console.log('création');
          const token = jwt.sign(googleUser, process.env.JWT_SECRET, { expiresIn: '12h' });
          
          res.cookie('token', token, {
            httpOnly: false,   // Passe à true si le cookie ne doit pas être lisible côté client
            secure: false,     // Passe à true si HTTPS
            sameSite: 'Lax',
            maxAge: 43200000   
          });

          res.send(`
              <html>
                <body>
                  <script>
                    // Envoi des infos au parent (frontend)
                    window.opener.postMessage({
                      status: "success",
                      token: "${token}",
                      message: "Nouvel utilisateur enregistré"
                    }, "${process.env.FRONT_END_URL}"); 

                    window.close();
                  </script>
                  <p>Connexion réussie. Cette fenêtre va se fermer automatiquement...</p>
                </body>
              </html>
        `);
        }
      } catch (createErr) {
        console.error('Erreur lors de la création de utilisateur :', createErr.message);
      }
    } else { // 
      return res.status(500).json({ message: "Erreur lors de la création ou de la connexion de l'utilisateur" });
    }
  } catch (err) {

    console.error('Erreur lors de la vérification utilisateur :', err.message);
  }

  //res.redirect('/?token=' + token);
}

exports.googleProtected = (req, res) => {
  res.json({ message: `Bienvenue ${req.user.name}`, user: req.user });
}
