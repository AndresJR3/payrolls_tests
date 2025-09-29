// src/config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // Crear tablas si no existen
    await createTables();
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    throw error;
  }
};

const createTables = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createPayrollsTable = `
    CREATE TABLE IF NOT EXISTS payrolls (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      employee_name VARCHAR(255) NOT NULL,
      salary DECIMAL(10,2) NOT NULL,
      pay_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createUsersTable);
    await pool.query(createPayrollsTable);
    console.log('📋 Tablas creadas/verificadas correctamente');
  } catch (error) {
    console.error('Error creando tablas:', error);
    throw error;
  }
};

module.exports = { pool, connectDB };