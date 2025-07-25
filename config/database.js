const mysql = require('mysql2/promise');
require('dotenv').config();

// konfigurasi database
const dbConfig = {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'mysql.railway.internal',
    user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'railway',
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// pool koneksi 
const pool = mysql.createPool(dbConfig);

// tes koneksi 
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection successful');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
};

module.exports = {
    pool,
    testConnection
};