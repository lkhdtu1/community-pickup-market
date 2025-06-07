// Migration script to fix database schema transition
// This script handles the transition from producer-based products to shop-based products

const { Client } = require('pg');

async function fixDatabaseMigration() {  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'community_market'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // 1. First, let's see what producers exist
    const producersResult = await client.query('SELECT * FROM producers');
    console.log('Existing producers:', producersResult.rows.length);

    // 2. Delete all existing products to avoid foreign key issues
    console.log('Deleting existing products...');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM products');

    // 3. For each producer, create a default shop
    for (const producer of producersResult.rows) {
      console.log(`Creating default shop for producer ${producer.id}`);
      
      // Get the user email for the shop name
      const userResult = await client.query('SELECT email FROM users WHERE id = $1', [producer.userId]);
      const userEmail = userResult.rows[0]?.email || 'Unknown Producer';
      
      const shopName = `${userEmail.split('@')[0]}'s Shop`;
      
      await client.query(`
        INSERT INTO shops (id, name, description, address, phone, email, specialties, images, certifications, "pickupInfo", "isActive", "createdAt", "updatedAt", "producerId")
        VALUES (
          uuid_generate_v4(),
          $1,
          'Default shop for producer',
          'Location to be updated',
          NULL,
          $2,
          ARRAY[]::text[],
          ARRAY[]::text[],
          ARRAY[]::text[],
          '{"location": "To be updated", "hours": "To be updated", "instructions": "To be updated"}'::jsonb,
          true,
          NOW(),
          NOW(),
          $3
        )
      `, [shopName, userEmail, producer.id]);
    }

    console.log('Database migration completed successfully');
    await client.end();
  } catch (error) {
    console.error('Error during migration:', error);
    await client.end();
    process.exit(1);
  }
}

if (require.main === module) {
  fixDatabaseMigration();
}

module.exports = { fixDatabaseMigration };
