const { verifyToken } = require('../config/jwt');
const { errorResponse } = require('../utils/response');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return errorResponse(res, 108, 'Token tidak valid atau kadaluwarsa');
  }

  const decodedToken = verifyToken(token);
  if (!decodedToken) {
    return errorResponse(res, 108, 'Token tidak valid atau kadaluwarsa');
  }

  // Set email dari token ke request object untuk dipakai di controller
  req.email = decodedToken.email;
  next();
};

module.exports = {
  authenticateToken
};