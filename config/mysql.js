// db.config.js
import mysql from 'mysql2/promise';

// MySQL Database Configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'hills',
  password: 'Hillsgroup10',
  database: 'Market',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Successfully connected to MySQL database');
    console.log(`  Host: ${dbConfig.host}`);
    console.log(`  User: ${dbConfig.user}`);
    console.log(`  Database: ${dbConfig.database}`);
    connection.release();
  } catch (err) {
    console.error('✗ Error connecting to MySQL database:', err.message);
    throw err;
  }
};

// Execute test connection
testConnection();

// Query helper function
export const query = async (sql, params) => {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Execute helper function (for INSERT, UPDATE, DELETE)
export const execute = async (sql, params) => {
  try {
    const [result] = await pool.execute(sql, params);
    return result;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
};

// Get a connection from pool (for transactions)
export const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error getting connection:', error);
    throw error;
  }
};

// Close pool
export const closePool = async () => {
  try {
    await pool.end();
    console.log('Connection pool closed');
  } catch (error) {
    console.error('Error closing pool:', error);
    throw error;
  }
};

export default pool;