const express = require('express');
const router = express.Router();
const googleController = require('../../controllers/googleAuth/google.controller');

router.get('/auth', googleController.googleAuth);
router.get('/callback', googleController.googleCallback);

module.exports = router; 