const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    validateRegistration,
    validateLogin,
    validateUpdateProfile
} = require('../middleware/validation');

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const uniqueFilename = `${uuidv4()} ${path.extname(file.originalname)}`;
        cb(null, uniqueFilename);
    }
});

// Filter file untuk memastikan hanya jpeg dan png yang diupload
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Format Image tidak sesuai'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB maksimal
    },
    fileFilter: fileFilter
});


const memberController = require('../controllers/memberController');

// Public routes
router.post('/registration', validateRegistration, memberController.register);
router.post('/login', validateLogin, memberController.login);

// memerlukan autentikasi
router.get('/profile', authenticateToken, memberController.getProfile);
router.put('/profile/update', authenticateToken, validateUpdateProfile, memberController.updateProfile);
router.put('/profile/image', authenticateToken, upload.single('file'), memberController.updateProfileImage);

module.exports = router;