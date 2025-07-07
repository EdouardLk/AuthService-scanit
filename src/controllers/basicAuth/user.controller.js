//BasicAuth

// routes/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;


exports.login = async (req, res) => {
  console.log("🔐 Tentative de connexion reçue");
  console.log("📧 Email:", req.body.email);

  const { email, password } = req.body;
  let userToFind = null;

  try {
    console.log("🔍 Recherche de l'utilisateur dans la base de données");
    console.log("🌐 URL:", `${process.env.DATABASE_SERVICE_URL}/users/login`);
    
    const response = await fetch(`${process.env.DATABASE_SERVICE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({email, password})
    });

    console.log("📡 Réponse du backend:", response.status);
    
    if (!response.ok) {
      console.log("❌ Erreur backend:", response.status);
      throw new Error(`Response status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("✅ Données reçues du backend");
    
    userToFind = data.user;
    console.log("👤 Utilisateur trouvé:", userToFind.email);
    
    const token = jwt.sign(
      {
        id: userToFind.id,
        email: userToFind.email,
        firstName: userToFind.firstName,
        lastName: userToFind.lastName,
        userName: userToFind.userName,
        credits: userToFind.credits,
        phone: userToFind.phone,
        role: userToFind.role,
        tier: userToFind.tier,
        isVerified: userToFind.isVerified
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    console.log("🎟️ Token généré");

    res.cookie('token', token, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
      maxAge: 43200000
    });

    return res.status(200).json({ message: 'connexion réussie', token: token });
  } catch (error) {
    console.error("❌ Erreur lors de la connexion:", error.message);
    return res.status(401).json({ message: "Email ou mot de passe incorrect" });
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
