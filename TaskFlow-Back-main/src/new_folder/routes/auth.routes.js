const express = require('express');

const router = express.Router();
const authController = require('../controllers/auth _controller');

router.post('/login', authController.login);

module.exports = router;