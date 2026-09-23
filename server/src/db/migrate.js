/**
 * migrate.js
 * Reads schema.sql and executes it against the configured MySQL 8+ database.
 * Run: node src/db/migrate.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config();

const fs   = require('fs');
const mysql = require('mysql2/promise');

async function migrate() {
  const dbName = process.env.DB_NAME || 'contractmanager';
  console.log('🗄️  Contract Manager — Database Migration');
  console.log(`   Host: ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || '3306'}`);
  console.log(`   Database: ${dbName}\n`);

  // First connect to MySQL server (without selecting DB) to ensure DB exists
  const rootConn = await mysql.createConnection({
    host:     process.env.DB_HOST     || '127.0.0.1',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await rootConn.end();

  // Now connect to the database and run schema
  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST     || '127.0.0.1',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
    multipleStatements: true,
  });

  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(sql);
    console.log('✅  Schema migrated successfully.');
  } catch (err) {
    console.error('❌  Migration failed:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
