const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'community_market',
  synchronize: false,
  logging: true,
});

async function addDateOfBirthColumn() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to database');
    
    // Check if column already exists
    const columnExists = await AppDataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name = 'dateOfBirth'
    `);
    
    if (columnExists.length === 0) {
      console.log('Adding dateOfBirth column...');
      await AppDataSource.query(`
        ALTER TABLE customers ADD COLUMN "dateOfBirth" DATE
      `);
      console.log('✅ dateOfBirth column added successfully');
    } else {
      console.log('ℹ️  dateOfBirth column already exists');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

addDateOfBirthColumn();
