const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; 

router.post('/confirm', async (req, res) => {
    try {
        console.log("=== Début de la confirmation d'email ===");
        console.log("Données reçues:", req.body);

        // génération d'un token avec id du user pour l'envoyer vers le service de mail
        const token = jwt.sign(
            { id: req.body.id, email: req.body.email }, 
            JWT_SECRET, 
            { expiresIn: '10m' }
        );
        console.log("Token généré pour l'email");

        const notificationUrl = `${process.env.NOTIFICATION_SERVICE_URL}/email/confirm`;
        console.log("Tentative d'envoi vers:", notificationUrl);
        
        const response = await fetch(notificationUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({token: token, email: req.body.email})
        });

        console.log("Réponse du service de notification:", response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erreur du service de notification:", errorText);
            throw new Error(`Response status: ${response.status}`);
        } else {
            console.log("Email correctement envoyé");
            res.status(200).json({message: "requête vers le service de mail bien envoyée"});
        }
    } catch (error) {
        console.error("Erreur lors de l'envoi d'email:", error);
        res.status(500).json({error: error.message});
    }
});


router.get('/verifyToken/:token', (req, res) => { // méthode à la racine simplement pour vérifier la validité d'un token, les autres services appelerons cette méthode dans leur middelware
  
    const token = req.params.token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(decoded);
        res.status(200).json({ user: decoded });
    } catch (err) {        
        res.status(403).json({ message: 'La periode de validité de ce mail est expiré' });
    }
});


module.exports = router;
