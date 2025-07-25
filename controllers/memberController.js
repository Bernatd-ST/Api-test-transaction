const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const { generateToken } = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/response');
const fs = require('fs');

// Register user
const register = async (req, res) => {
  const { email, first_name, last_name, password } = req.body;
  
  try {
    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return errorResponse(res, 102, 'Email sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)',
      [email, first_name, last_name, hashedPassword]
    );

    // Create balance record for the user
    await pool.execute(
      'INSERT INTO balances (user_id, balance) VALUES (?, ?)',
      [result.insertId, 0]
    );

    return successResponse(res, 'Registrasi berhasil silahkan login');
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan pada server');
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find user by email
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return errorResponse(res, 103, 'Username atau password salah');
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 103, 'Username atau password salah');
    }

    // Generate JWT
    const token = generateToken({ email: user.email });

    return successResponse(res, 'Login Sukses', { token });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan pada server');
  }
};

// Get user profile
const getProfile = async (req, res) => {
  const { email } = req;
  
  try {
    // Get user profile
    const [users] = await pool.execute(
      'SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return errorResponse(res, 108, 'Token tidak valid atau kadaluwarsa');
    }

    const user = users[0];

    return successResponse(res, 'Sukses', user);
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan pada server');
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const { email } = req;
  const { first_name, last_name } = req.body;
  
  try {
    // Update user profile
    await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ? WHERE email = ?',
      [first_name, last_name, email]
    );

    // Get updated profile
    const [users] = await pool.execute(
      'SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?',
      [email]
    );

    const user = users[0];

    return successResponse(res, 'Update Pofile berhasil', user);
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan pada server');
  }
};

// Update profile image
const updateProfileImage = async (req, res) => {
  const { email } = req;
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      return errorResponse(res, 102, 'Format Image tidak sesuai');
    }

    // Get base URL from request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const profileImage = `${baseUrl}/uploads/${req.file.filename}`;

    // Get current profile image
    const [users] = await pool.execute(
      'SELECT profile_image FROM users WHERE email = ?',
      [email]
    );

    // If there's an existing profile image, delete it
    if (users[0].profile_image) {
      const oldImagePath = users[0].profile_image.replace(baseUrl, '').trim();
      if (fs.existsSync(`.${oldImagePath}`)) {
        fs.unlinkSync(`.${oldImagePath}`);
      }
    }

    // Update profile image
    await pool.execute(
      'UPDATE users SET profile_image = ? WHERE email = ?',
      [profileImage, email]
    );

    // Get updated profile
    const [updatedUsers] = await pool.execute(
      'SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?',
      [email]
    );

    const user = updatedUsers[0];

    return successResponse(res, 'Update Profile Image berhasil', user);
  } catch (error) {
    console.error('Update profile image error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan pada server');
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updateProfileImage
};