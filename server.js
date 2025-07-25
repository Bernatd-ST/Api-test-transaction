require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');



const app = express();
const port = process.env.PORT || 3000;
const memberRoutes = require('./routes/memberRoutes');
const informationRoutes = require('./routes/informationRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(memberRoutes);
app.use(informationRoutes);
app.use(transactionRoutes);

// test database connection
testConnection();

// Default route
app.get('/', (req, res) => {
    res.json({
        status: 0,
        message: 'API is running',
        data: null
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 404,
        message: 'Endpoint tidak ditemukan',
        data: null
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: 'Terjadi kesalahan pada server',
      data: null
    });
  });
  
  // Start server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
  module.exports = app;