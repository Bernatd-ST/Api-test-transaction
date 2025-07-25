const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const informationController = require('../controllers/informationController');  

// public routes
router.get('/information/banner', informationController.getBanners);

// private routes
router.get('/information/services', authenticateToken, informationController.getServices);


module.exports = router;
