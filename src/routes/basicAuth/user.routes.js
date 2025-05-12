const express = require('express');
const router = express.Router();
const userController = require('../../controllers/basicAuth/user.controller');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; 

router.post('/login', userController.login);
router.post('/logout' ,userController.logout);

router.get('/verifyToken', (req, res) => { // méthode à la racine simplement pour vérifier la validité d'un token, les autres services appelerons cette méthode dans leur middelware inshAllah 
    const authHeader = req.headers['authorization'];
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ message: 'Header Authorization manquant ou mal formé' });
    }
  
    const token = authHeader.split(' ')[1]; // Récupère le token après "Bearer"
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      //console.log(decoded);
      res.status(200).json({ user: decoded });
    } catch (err) {
      res.status(403).json({ message: 'Token invalide ou expiré' });
    }
});


module.exports = router;
