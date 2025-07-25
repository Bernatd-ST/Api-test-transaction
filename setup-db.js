const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Baca kredensial database dari environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};

async function setupDatabase() {
  console.log('Starting database setup...');
  let connection;
  
  try {
    // Baca file SQL
    const sqlFilePath = path.join(__dirname, 'db.sql');
    console.log(`Reading SQL file from: ${sqlFilePath}`);
    
    let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('SQL file read successfully');
    
    // Buat koneksi ke MySQL
    console.log('Connecting to MySQL...');
    console.log(`Host: ${dbConfig.host}, User: ${dbConfig.user}, Database: ${dbConfig.database}, Port: ${dbConfig.port}`);
    
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
      multipleStatements: true // Penting untuk menjalankan multiple queries
    });
    
    console.log('Connected to MySQL successfully');
    
    // Pastikan database ada
    console.log(`Creating database ${dbConfig.database} if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.query(`USE ${dbConfig.database}`);
    
    // Split SQL content berdasarkan delimiter dan jalankan satu per satu
    console.log('Executing SQL statements...');
    
    // Hapus CREATE DATABASE dan USE statements karena kita sudah melakukannya di atas
    sqlContent = sqlContent.replace(/CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS\s+[^;]+;/i, '');
    sqlContent = sqlContent.replace(/USE\s+[^;]+;/i, '');
    
    // Eksekusi SQL
    await connection.query(sqlContent);
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Export function untuk digunakan di server.js
module.exports = setupDatabase;

// Jika file dijalankan langsung
if (require.main === module) {
  setupDatabase()
    .then(() => console.log('Setup complete!'))
    .catch(err => {
      console.error('Setup failed:', err);
      process.exit(1);
    });
}
