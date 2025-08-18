const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; 

router.post('/confirm', async (req, res) => {
    //envoyer une requête au service de mail pour le mail de confirmation de compte
    console.log("in auth confirm mail")

    // génération d'un token avec id du user pour l'envoyer vers le service de mail (sera nécessaire pour le mail de confirmation)
    const token = jwt.sign(
            { id: req.body.id, email: req.body.email }, 
            JWT_SECRET, 
            { expiresIn: '1h' } // periode de validité du token, le client aura 1h pour confirmer son email
        );
 
    const response = await fetch(`${process.env.NOTIFICATION_SERVICE_URL}/email/confirm` , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({token : token , email : req.body.email})
    });

        
    if (!response.ok) {
        //console.log("ici");
        throw new Error(`Response status: ${response.status}`);                        
    }else{
        console.log("Email correctement envoyé");
        res.status(200).json({message : "reqûete vers le service de mail bien envoyé"})
    }

});


router.get('/verifyToken', (req, res) => { // méthode à la racine simplement pour vérifier la validité d'un token, les autres services appelerons cette méthode dans leur middelware
    const authHeader = req.headers['authorization'];
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ message: 'Header Authorization manquant ou mal formuler' });
    }
  
    const token = authHeader.split(' ')[1]; // Récupère le token après "Bearer"
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log(decoded);
      res.status(200).json({ user: decoded });
    } catch (err) {
      res.status(403).json({ message: 'Token invalide ou expiré' });
    }
});


module.exports = router;