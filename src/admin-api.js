/**
 * Admin Panel API Integration
 * Handles exam creation and auto-generates dashboard credentials
 */

const { Client } = require('pg');

// PostgreSQL Client
const pgClient = new Client({
    host: 'localhost',
    port: 5432,
    database: 'mpa_db',
    user: 'postgres',
    password: 'postgres'
});

/**
 * Generate random password
 */
function generatePassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

/**
 * Generate dashboard username from exam name
 */
function generateUsername(examName) {
    return examName
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .substring(0, 30) + '_user';
}

/**
 * Create exam and auto-generate dashboard credentials
 */
async function createExamWithCredentials(examData) {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'mpa_db',
        user: 'postgres',
        password: 'postgres'
    });

    try {
        await client.connect();

        // Generate credentials
        const username = generateUsername(examData.name);
        const password = generatePassword();

        // Insert into dashboard_credentials
        const result = await client.query(
            `INSERT INTO dashboard_credentials (exam_id, exam_name, username, password)
             VALUES ($1, $2, $3, $4)
             RETURNING id, exam_id, exam_name, username, password`,
            [examData.id, examData.name, username, password]
        );

        const credentials = result.rows[0];

        return {
            success: true,
            exam: examData,
            credentials: {
                username: credentials.username,
                password: credentials.password,
                examId: credentials.exam_id,
                examName: credentials.exam_name
            },
            message: 'Exam created successfully with dashboard credentials'
        };
    } catch (error) {
        console.error('Error creating exam:', error);
        throw error;
    } finally {
        await client.end();
    }
}

/**
 * Get dashboard credentials for an exam
 */
async function getExamCredentials(examId) {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'mpa_db',
        user: 'postgres',
        password: 'postgres'
    });

    try {
        await client.connect();

        const result = await client.query(
            'SELECT id, exam_id, exam_name, username, password FROM dashboard_credentials WHERE exam_id = $1',
            [examId]
        );

        if (result.rows.length === 0) {
            return { success: false, message: 'Exam not found' };
        }

        const cred = result.rows[0];
        return {
            success: true,
            credentials: {
                username: cred.username,
                password: cred.password,
                examId: cred.exam_id,
                examName: cred.exam_name
            }
        };
    } catch (error) {
        console.error('Error getting credentials:', error);
        throw error;
    } finally {
        await client.end();
    }
}

/**
 * Update dashboard credentials for an exam
 */
async function updateExamCredentials(examId, newPassword) {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'mpa_db',
        user: 'postgres',
        password: 'postgres'
    });

    try {
        await client.connect();

        const result = await client.query(
            `UPDATE dashboard_credentials 
             SET password = $1, updated_at = CURRENT_TIMESTAMP
             WHERE exam_id = $2
             RETURNING id, exam_id, exam_name, username, password`,
            [newPassword, examId]
        );

        if (result.rows.length === 0) {
            return { success: false, message: 'Exam not found' };
        }

        const cred = result.rows[0];
        return {
            success: true,
            credentials: {
                username: cred.username,
                password: cred.password,
                examId: cred.exam_id,
                examName: cred.exam_name
            },
            message: 'Credentials updated successfully'
        };
    } catch (error) {
        console.error('Error updating credentials:', error);
        throw error;
    } finally {
        await client.end();
    }
}

/**
 * List all exam credentials
 */
async function listAllCredentials() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'mpa_db',
        user: 'postgres',
        password: 'postgres'
    });

    try {
        await client.connect();

        const result = await client.query(
            'SELECT id, exam_id, exam_name, username FROM dashboard_credentials ORDER BY exam_id'
        );

        return {
            success: true,
            credentials: result.rows.map(row => ({
                id: row.id,
                examId: row.exam_id,
                examName: row.exam_name,
                username: row.username
            }))
        };
    } catch (error) {
        console.error('Error listing credentials:', error);
        throw error;
    } finally {
        await client.end();
    }
}

module.exports = {
    createExamWithCredentials,
    getExamCredentials,
    updateExamCredentials,
    listAllCredentials,
    generatePassword,
    generateUsername
};
