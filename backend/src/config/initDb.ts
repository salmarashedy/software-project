import pool from './database';

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        status VARCHAR(20) DEFAULT 'To Do',
        priority VARCHAR(10) DEFAULT 'Medium',
        assignee_name VARCHAR(100) DEFAULT '',
        assignee_avatar VARCHAR(255) DEFAULT '',
        due_date DATE,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Error initializing database tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default createTables;
