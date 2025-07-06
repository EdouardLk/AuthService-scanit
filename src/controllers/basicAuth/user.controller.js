//BasicAuth

// routes/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;


exports.login = async (req, res) => {

  //console.log(req.body);
  const { email, password } = req.body;
  let userToFind = null; // sera determiné avec une requête dans le service bdd
  //console.log(email +' ' + password);

  try {
        // On va rechercher si l'utilisateur existe , 
        const response = await fetch(`${process.env.DATABASE_SERVICE_URL}/users/login` , {
          method: 'POST', // modifier en requête get en transmettant le content en queryParams et non dans le body
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({email, password})
        });

        
        if (!response.ok) {
          //console.log("ici");
          throw new Error(`Response status: ${response.status}`);                        
        }
        
        await response.json().then((data) => {
          userToFind = data.user
          console.log("Données utilisateur reçues du backend:", userToFind);
        });        
        const token = jwt.sign( // informations qui seront enregistré dans le token (lisible avec la méthode jwt.verify)
          {
           id: userToFind.id, 
           email: userToFind.email,
           firstName : userToFind.firstName,
           lastName : userToFind.lastName,
           userName : userToFind.userName,
           credits: userToFind.credits,
           phone: userToFind.phone,
           role: userToFind.role, // admin / moderator / paysans (user) lol
           tier: userToFind.tier,
           isVerified : userToFind.isVerified
          }, 
          JWT_SECRET, 
          { expiresIn: '12h' }
        );

        res.cookie('token', token, {
          httpOnly: false,        // Protège contre XSS
          secure: false,          // En production, mettre à true pour https
          sameSite: 'Lax',    // Ou 'Strict' selon ton cas
          maxAge: 43200000        // Durée en ms (12h)
        });

        return res.status(200).json({ message : 'connexion réussie', token : token });
                
    } catch (error) {
        console.error(error.message);
        return res.status(401).json({ message:  "Email ou mot de passe incorrect"});
    }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: false,
    secure: false,       // Active seulement en HTTPS (production)
    sameSite: 'Lax', // Ou 'Lax' selon tes besoins
  });

  res.status(200).json({ message: 'Déconnexion réussie' });
};
