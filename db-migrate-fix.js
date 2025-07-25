const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Fungsi untuk menjalankan migrasi database
async function migrate() {
  console.log('Starting database migration with privileges fix...');
  
  // Menggunakan kredensial hardcode Railway yang diketahui berfungsi
  // Dari connection string: mysql://root:GpAhnIwcCeGylFIUXQVtTTtmEUyGOxKn@gondola.proxy.rlwy.net:36527/railway
  const dbConfig = {
    host: 'gondola.proxy.rlwy.net', // Hostname publik Railway
    user: 'root',
    password: 'GpAhnIwcCeGylFIUXQVtTTtmEUyGOxKn',
    database: 'railway',
    port: 36527 // Port publik Railway
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
    
    // Force DROP dan recreate tables
    const dropTablesSQL = `
      DROP TABLE IF EXISTS transactions;
      DROP TABLE IF EXISTS balances;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS services;
      DROP TABLE IF EXISTS banners;
    `;
    
    sqlContent = dropTablesSQL + sqlContent;
    
    console.log('SQL modified to use railway database with force drop tables');
    
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
    
    // Jalankan FLUSH PRIVILEGES untuk memastikan izin terbaru
    await connection.query('FLUSH PRIVILEGES');
    console.log('Privileges flushed');
    
    // Jalankan SQL script
    await connection.query(sqlContent);
    console.log('Migration completed successfully!');
    
    // Tampilkan tabel yang berhasil dibuat
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables created:');
    tables.forEach(table => {
      const tableName = table[`Tables_in_${dbConfig.database}`];
      console.log(`- ${tableName}`);
    });

    // Verifikasi data
    console.log('\nVerifying data:');
    
    // Cek services
    const [services] = await connection.query('SELECT COUNT(*) as count FROM services');
    console.log(`Services count: ${services[0].count}`);
    
    // Cek banners
    const [banners] = await connection.query('SELECT COUNT(*) as count FROM banners');
    console.log(`Banners count: ${banners[0].count}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// Jalankan migrasi
migrate();
