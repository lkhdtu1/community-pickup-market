// Migration script to add payment fields to Order table
const { Client } = require('pg');
require('dotenv').config();

async function applyOrderPaymentMigration() {
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

    // Check if payment fields already exist
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name IN ('payment_method_id', 'payment_intent_id', 'payment_status')
    `);

    const existingColumns = checkColumns.rows.map(row => row.column_name);
    console.log('Existing payment columns:', existingColumns);

    // Add payment_method_id if not exists
    if (!existingColumns.includes('payment_method_id')) {
      console.log('Adding payment_method_id column...');
      await client.query(`
        ALTER TABLE orders 
        ADD COLUMN payment_method_id VARCHAR(255) NULL
      `);
    }

    // Add payment_intent_id if not exists
    if (!existingColumns.includes('payment_intent_id')) {
      console.log('Adding payment_intent_id column...');
      await client.query(`
        ALTER TABLE orders 
        ADD COLUMN payment_intent_id VARCHAR(255) NULL
      `);
    }

    // Add payment_status if not exists
    if (!existingColumns.includes('payment_status')) {
      console.log('Adding payment_status column...');
      await client.query(`
        ALTER TABLE orders 
        ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending'
      `);
    }

    // Update existing orders to have pending payment status
    const updateResult = await client.query(`
      UPDATE orders 
      SET payment_status = 'pending' 
      WHERE payment_status IS NULL
    `);
    
    console.log(`Updated ${updateResult.rowCount} orders with pending payment status`);

    console.log('Order payment migration completed successfully');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  applyOrderPaymentMigration();
}

module.exports = { applyOrderPaymentMigration };
