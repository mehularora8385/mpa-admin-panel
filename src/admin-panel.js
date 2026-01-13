/**
 * ADMIN PANEL - Exam Management System
 * Allows admins to create exams and auto-generate credentials
 */

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// PostgreSQL Connection Pool
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'mpa_db',
    user: 'mpa_admin',
    password: 'mpa_admin_pass123',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Utility Functions
function generatePassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function generateUsername(examName) {
    return examName
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .substring(0, 20) + '_' + Math.random().toString(36).substring(7);
}

// ============================================================================
// ADMIN API ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/exams
 * List all exams
 */
app.get('/api/admin/exams', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                id, 
                exam_name, 
                exam_code,
                username,
                status,
                total_candidates,
                total_operators,
                total_centres,
                created_at,
                updated_at
             FROM exams 
             ORDER BY created_at DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/admin/exams
 * Create new exam with auto-generated credentials
 */
app.post('/api/admin/exams', async (req, res) => {
    const client = await pool.connect();
    try {
        const { exam_name, exam_code, total_candidates, total_operators, total_centres } = req.body;

        // Validate input
        if (!exam_name || !exam_code) {
            return res.status(400).json({ success: false, error: 'Exam name and code required' });
        }

        await client.query('BEGIN');

        // Generate credentials
        const username = generateUsername(exam_name);
        const password = generatePassword();

        // Insert exam
        const examResult = await client.query(
            `INSERT INTO exams 
             (exam_name, exam_code, username, password, status, total_candidates, total_operators, total_centres)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [exam_name, exam_code, username, password, 'active', total_candidates || 0, total_operators || 0, total_centres || 0]
        );

        // Insert into dashboard_credentials
        await client.query(
            `INSERT INTO dashboard_credentials (exam_id, exam_name, username, password)
             VALUES ($1, $2, $3, $4)`,
            [examResult.rows[0].id, exam_name, username, password]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Exam created successfully',
            exam: examResult.rows[0],
            credentials: {
                username,
                password,
                examId: examResult.rows[0].id,
                examName: exam_name
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating exam:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
});

/**
 * GET /api/admin/exams/:id
 * Get exam details
 */
app.get('/api/admin/exams/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM exams WHERE id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Exam not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching exam:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/admin/exams/:id
 * Update exam
 */
app.put('/api/admin/exams/:id', async (req, res) => {
    try {
        const { exam_name, exam_code, status, total_candidates, total_operators, total_centres } = req.body;

        const result = await pool.query(
            `UPDATE exams 
             SET exam_name = COALESCE($1, exam_name),
                 exam_code = COALESCE($2, exam_code),
                 status = COALESCE($3, status),
                 total_candidates = COALESCE($4, total_candidates),
                 total_operators = COALESCE($5, total_operators),
                 total_centres = COALESCE($6, total_centres),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7
             RETURNING *`,
            [exam_name, exam_code, status, total_candidates, total_operators, total_centres, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Exam not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error updating exam:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/admin/exams/:id
 * Delete exam
 */
app.delete('/api/admin/exams/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Delete from dashboard_credentials
        await client.query(
            `DELETE FROM dashboard_credentials WHERE exam_id = $1`,
            [req.params.id]
        );

        // Delete exam
        const result = await client.query(
            `DELETE FROM exams WHERE id = $1 RETURNING *`,
            [req.params.id]
        );

        await client.query('COMMIT');

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Exam not found' });
        }

        res.json({ success: true, message: 'Exam deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting exam:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
});

/**
 * POST /api/admin/exams/:id/reset-credentials
 * Reset credentials for an exam
 */
app.post('/api/admin/exams/:id/reset-credentials', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get exam
        const examResult = await client.query(
            `SELECT * FROM exams WHERE id = $1`,
            [req.params.id]
        );

        if (examResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Exam not found' });
        }

        const exam = examResult.rows[0];
        const newPassword = generatePassword();

        // Update exam password
        await client.query(
            `UPDATE exams SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [newPassword, req.params.id]
        );

        // Update dashboard credentials
        await client.query(
            `UPDATE dashboard_credentials SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE exam_id = $2`,
            [newPassword, req.params.id]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Credentials reset successfully',
            credentials: {
                username: exam.username,
                password: newPassword,
                examId: exam.id,
                examName: exam.exam_name
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error resetting credentials:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
});

/**
 * GET /api/admin/exams/:id/credentials
 * Get exam credentials
 */
app.get('/api/admin/exams/:id/credentials', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT exam_id, exam_name, username, password, created_at, updated_at
             FROM dashboard_credentials 
             WHERE exam_id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Credentials not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching credentials:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
app.get('/api/admin/stats', async (req, res) => {
    try {
        const examsResult = await pool.query('SELECT COUNT(*) as count FROM exams');
        const candidatesResult = await pool.query('SELECT COUNT(*) as count FROM candidates');
        const operatorsResult = await pool.query('SELECT COUNT(*) as count FROM operators');
        const centresResult = await pool.query('SELECT COUNT(*) as count FROM centres');

        res.json({
            success: true,
            stats: {
                totalExams: parseInt(examsResult.rows[0].count),
                totalCandidates: parseInt(candidatesResult.rows[0].count),
                totalOperators: parseInt(operatorsResult.rows[0].count),
                totalCentres: parseInt(centresResult.rows[0].count)
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/admin/health', (req, res) => {
    res.json({ status: 'ok', service: 'admin-panel' });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: err.message });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
    console.log(`║          ADMIN PANEL - EXAM MANAGEMENT SYSTEM                 ║`);
    console.log(`╚════════════════════════════════════════════════════════════════╝`);
    console.log(`\n✅ Admin Panel Server running on port ${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api/admin`);
    console.log(`\n`);
});

module.exports = app;
