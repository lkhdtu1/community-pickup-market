// Simple database cleanup script
const { Client } = require('pg');

async function cleanupDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'community_market'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    console.log('Deleting existing order items...');
    await client.query('DELETE FROM order_items WHERE true');
    
    console.log('Deleting existing products...');
    await client.query('DELETE FROM products WHERE true');

    console.log('Database cleanup completed successfully');
    await client.end();
  } catch (error) {
    console.error('Error during cleanup:', error);
    await client.end();
    process.exit(1);
  }
}

cleanupDatabase();
