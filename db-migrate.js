const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  console.log('Starting database migration...');
  
  const dbConfig = {
    host: 'yamabiko.proxy.rlwy.net', 
    user: 'root',
    password: 'RoAAuIoCWkqiirhHMefCNnFgtEDIPxyD',
    database: 'railway',
    port: 16584 
  };
  
  console.log(`Connecting to MySQL: ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}`);
  
  let connection;
  
  try {
    console.log('Reading SQL file...');
    let sqlContent = fs.readFileSync(path.join(__dirname, 'db.sql'), 'utf8');
    
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
      multipleStatements: true 
    });
    
    console.log('Connected to MySQL. Running SQL script...');
    
    // Eksekusi script SQL
    const [results] = await connection.query(sqlContent);
    
    console.log('Migration completed successfully!');
    console.log('Tables created:');
    
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

migrate();
