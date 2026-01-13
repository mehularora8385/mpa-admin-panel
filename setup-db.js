#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates dashboard_credentials table in PostgreSQL
 * 
 * Usage: node setup-db.js
 */

const { Client } = require('pg');

// Database connection config
const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'mpa_db',
    user: 'postgres',
    password: 'postgres'  // Default PostgreSQL password
};

// SQL to create table and insert sample data
const setupSQL = `
-- Create dashboard_credentials table
CREATE TABLE IF NOT EXISTS dashboard_credentials (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL UNIQUE,
    exam_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample credentials
INSERT INTO dashboard_credentials (exam_id, exam_name, username, password)
VALUES 
    (1, 'Exam A', 'exam_a_user', 'exam_a_pass'),
    (2, 'Exam B', 'exam_b_user', 'exam_b_pass'),
    (3, 'Mock Exam 1', 'mock_1_user', 'mock_1_pass')
ON CONFLICT (exam_id) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dashboard_username ON dashboard_credentials(username);
CREATE INDEX IF NOT EXISTS idx_dashboard_exam_id ON dashboard_credentials(exam_id);
`;

async function setupDatabase() {
    const client = new Client(dbConfig);

    try {
        console.log('🔌 Connecting to PostgreSQL...');
        await client.connect();
        console.log('✅ Connected successfully!');

        console.log('\n📝 Creating dashboard_credentials table...');
        await client.query(setupSQL);
        console.log('✅ Table created successfully!');

        // Verify the data
        console.log('\n📊 Verifying credentials...');
        const result = await client.query('SELECT id, exam_id, exam_name, username FROM dashboard_credentials ORDER BY exam_id;');
        console.log('\n✅ Credentials in database:');
        result.rows.forEach(row => {
            console.log(`   - ${row.username} (Exam: ${row.exam_name})`);
        });

        console.log('\n✅ Database setup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Make sure PostgreSQL is running on localhost:5432');
        console.error('   2. Check if database "mpa_db" exists');
        console.error('   3. Verify postgres user password is "postgres"');
        console.error('   4. If password is different, edit dbConfig in this script');
        process.exit(1);
    } finally {
        await client.end();
    }
}

setupDatabase();
