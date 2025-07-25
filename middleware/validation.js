const { errorResponse } = require('../utils/response');

// Validasi email
const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

// Middleware validasi registrasi
const validateRegistration = (req, res, next) => {
  const { email, first_name, last_name, password } = req.body;

  // Cek apakah semua field ada
  if (!email || !first_name || !last_name || !password) {
    return errorResponse(res, 102, 'Semua field harus diisi');
  }

  // Validasi email
  if (!validateEmail(email)) {
    return errorResponse(res, 102, 'Parameter email tidak sesuai format');
  }

  // Validasi password
  if (password.length < 8) {
    return errorResponse(res, 102, 'Password minimal 8 karakter');
  }

  next();
};

// Middleware validasi login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 102, 'Email dan password harus diisi');
  }

  // Validasi email
  if (!validateEmail(email)) {
    return errorResponse(res, 102, 'Parameter email tidak sesuai format');
  }

  next();
};

// Middleware validasi update profile
const validateUpdateProfile = (req, res, next) => {
  const { first_name, last_name } = req.body;

  if (!first_name || !last_name) {
    return errorResponse(res, 102, 'First name dan last name harus diisi');
  }

  next();
};

// Middleware validasi top up
const validateTopup = (req, res, next) => {
  const { amount } = req.body;

  if (!amount) {
    return errorResponse(res, 102, 'Amount harus diisi');
  }

  if (isNaN(amount) || parseInt(amount) <= 0) {
    return errorResponse(res, 102, 'Amount harus berupa angka positif');
  }

  next();
};

// Middleware validasi transaksi
const validateTransaction = (req, res, next) => {
  const { service_code, amount, transaction_type } = req.body;

  if (!service_code || !amount || !transaction_type) {
    return errorResponse(res, 102, 'Semua field harus diisi');
  }

  if (isNaN(amount) || parseInt(amount) <= 0) {
    return errorResponse(res, 102, 'Amount harus berupa angka positif');
  }

  next();
};


module.exports = {
  validateRegistration,
  validateLogin,
  validateUpdateProfile,
  validateTopup,
  validateTransaction
};