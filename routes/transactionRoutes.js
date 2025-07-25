const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateTopup, validateTransaction } = require('../middleware/validation');
const transactionController = require('../controllers/transactionController');

// semua route memerlukan autentikasi
router.get('/transaction/balance', authenticateToken, transactionController.getBalance);
router.post('/transaction/topup', authenticateToken, validateTopup, transactionController.topup);
router.post('/transaction', authenticateToken, validateTransaction, transactionController.createTransaction);
router.get('/transaction/history', authenticateToken, transactionController.getHistory);

module.exports = router;