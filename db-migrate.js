const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Fungsi untuk menjalankan migrasi database
async function migrate() {
  console.log('Starting database migration...');
  
  // Menggunakan kredensial hardcode Railway yang diketahui berfungsi
  // Dari connection string: mysql://root:RoAAuIoCWkqiirhHMefCNnFgtEDIPxyD@yamabiko.proxy.rlwy.net:16584/railway
  const dbConfig = {
    host: 'yamabiko.proxy.rlwy.net', // Hostname publik Railway
    user: 'root',
    password: 'RoAAuIoCWkqiirhHMefCNnFgtEDIPxyD',
    database: 'railway',
    port: 16584 // Port publik Railway
  };
  
  // Tampilkan informasi koneksi
  console.log(`Connecting to MySQL: ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}`);
  
  let connection;
  
  try {
    // Baca file SQL
    console.log('Reading SQL file...');
    let sqlContent = fs.readFileSync(path.join(__dirname, 'db.sql'), 'utf8');
    
    // Modifikasi SQL untuk menggunakan database 'railway' alih-alih 'nutech_api_test'
    sqlContent = sqlContent
      .replace('CREATE DATABASE IF NOT EXISTS nutech_api_test;', '')
      .replace('USE nutech_api_test;', 'USE railway;');
    
    console.log('SQL modified to use railway database');
    
    // Koneksi ke MySQL
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
      database: dbConfig.database,
      multipleStatements: true // Penting untuk menjalankan beberapa query sekaligus
    });
    
    console.log('Connected to MySQL. Running SQL script...');
    
    // Eksekusi script SQL
    const [results] = await connection.query(sqlContent);
    
    console.log('Migration completed successfully!');
    console.log('Tables created:');
    
    // Tampilkan tabel yang dibuat
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`- ${tableName}`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// Jalankan migrasi
migrate();
