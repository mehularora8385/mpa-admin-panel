/**
 * DYNAMIC DASHBOARD SERVER
 * Exam-wise dashboard with credential validation and data filtering
 */

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

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

// Session storage (in production, use Redis)
const sessions = new Map();

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * POST /api/dashboard/login
 * Validate credentials and create session
 */
app.post('/api/dashboard/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password required' });
        }

        // Query database for credentials
        const result = await pool.query(
            `SELECT dc.exam_id, dc.exam_name, e.exam_code, e.status
             FROM dashboard_credentials dc
             LEFT JOIN exams e ON dc.exam_id = e.id
             WHERE dc.username = $1 AND dc.password = $2`,
            [username, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const credential = result.rows[0];

        // Check if exam is active
        if (credential.status !== 'active') {
            return res.status(403).json({ success: false, error: 'Exam is not active' });
        }

        // Create session
        const sessionId = require('crypto').randomBytes(32).toString('hex');
        const sessionData = {
            examId: credential.exam_id,
            examName: credential.exam_name,
            examCode: credential.exam_code,
            username,
            loginTime: new Date(),
            lastActivity: new Date()
        };

        sessions.set(sessionId, sessionData);

        // Set session expiry (5 minutes)
        setTimeout(() => {
            sessions.delete(sessionId);
        }, 5 * 60 * 1000);

        res.json({
            success: true,
            message: 'Login successful',
            sessionId,
            exam: {
                id: credential.exam_id,
                name: credential.exam_name,
                code: credential.exam_code
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/dashboard/logout
 * Logout and destroy session
 */
app.post('/api/dashboard/logout', (req, res) => {
    try {
        const { sessionId } = req.body;
        sessions.delete(sessionId);
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/dashboard/session/:sessionId
 * Verify session and get exam info
 */
app.get('/api/dashboard/session/:sessionId', (req, res) => {
    try {
        const session = sessions.get(req.params.sessionId);

        if (!session) {
            return res.status(401).json({ success: false, error: 'Session expired' });
        }

        // Update last activity
        session.lastActivity = new Date();

        res.json({
            success: true,
            session: {
                examId: session.examId,
                examName: session.examName,
                examCode: session.examCode,
                username: session.username,
                loginTime: session.loginTime
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// DASHBOARD DATA ENDPOINTS (EXAM-WISE FILTERED)
// ============================================================================

/**
 * Middleware to verify session
 */
const verifySession = (req, res, next) => {
    const sessionId = req.headers['x-session-id'];

    if (!sessionId) {
        return res.status(401).json({ success: false, error: 'Session ID required' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
        return res.status(401).json({ success: false, error: 'Session expired' });
    }

    req.session = session;
    next();
};

/**
 * GET /api/dashboard/overview
 * Get exam overview statistics
 */
app.get('/api/dashboard/overview', verifySession, async (req, res) => {
    try {
        const examId = req.session.examId;

        const candidatesResult = await pool.query(
            `SELECT COUNT(*) as total, 
                    SUM(CASE WHEN attendance = 'present' THEN 1 ELSE 0 END) as present,
                    SUM(CASE WHEN verification = 'verified' THEN 1 ELSE 0 END) as verified
             FROM candidates 
             WHERE exam_id = $1`,
            [examId]
        );

        const operatorsResult = await pool.query(
            `SELECT COUNT(*) as total FROM operators WHERE exam_id = $1`,
            [examId]
        );

        const centresResult = await pool.query(
            `SELECT COUNT(*) as total FROM centres WHERE exam_id = $1`,
            [examId]
        );

        const candidates = candidatesResult.rows[0];
        const attendanceRate = candidates.total > 0 ? Math.round((candidates.present / candidates.total) * 100) : 0;
        const verificationRate = candidates.total > 0 ? Math.round((candidates.verified / candidates.total) * 100) : 0;

        res.json({
            success: true,
            data: {
                examName: req.session.examName,
                examCode: req.session.examCode,
                totalCandidates: parseInt(candidates.total),
                presentCandidates: parseInt(candidates.present) || 0,
                verifiedCandidates: parseInt(candidates.verified) || 0,
                attendanceRate,
                verificationRate,
                totalOperators: parseInt(operatorsResult.rows[0].total),
                totalCentres: parseInt(centresResult.rows[0].total)
            }
        });
    } catch (error) {
        console.error('Overview error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/dashboard/candidates
 * Get candidates for exam
 */
app.get('/api/dashboard/candidates', verifySession, async (req, res) => {
    try {
        const examId = req.session.examId;
        const { attendance, verification, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM candidates WHERE exam_id = $1';
        const params = [examId];
        let paramCount = 1;

        if (attendance) {
            paramCount++;
            query += ` AND attendance = $${paramCount}`;
            params.push(attendance);
        }

        if (verification) {
            paramCount++;
            query += ` AND verification = $${paramCount}`;
            params.push(verification);
        }

        query += ` ORDER BY roll_number ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Candidates error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/dashboard/operators
 * Get operators for exam
 */
app.get('/api/dashboard/operators', verifySession, async (req, res) => {
    try {
        const examId = req.session.examId;

        const result = await pool.query(
            `SELECT * FROM operators WHERE exam_id = $1 ORDER BY operator_id ASC`,
            [examId]
        );

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Operators error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/dashboard/centres
 * Get centres for exam
 */
app.get('/api/dashboard/centres', verifySession, async (req, res) => {
    try {
        const examId = req.session.examId;

        const result = await pool.query(
            `SELECT * FROM centres WHERE exam_id = $1 ORDER BY centre_code ASC`,
            [examId]
        );

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Centres error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/dashboard/reports
 * Get exam reports
 */
app.get('/api/dashboard/reports', verifySession, async (req, res) => {
    try {
        const examId = req.session.examId;

        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_candidates,
                SUM(CASE WHEN attendance = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN attendance = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN verification = 'verified' THEN 1 ELSE 0 END) as verified,
                SUM(CASE WHEN verification = 'pending' THEN 1 ELSE 0 END) as pending
             FROM candidates 
             WHERE exam_id = $1`,
            [examId]
        );

        const data = result.rows[0];

        res.json({
            success: true,
            data: {
                totalCandidates: parseInt(data.total_candidates),
                present: parseInt(data.present) || 0,
                absent: parseInt(data.absent) || 0,
                verified: parseInt(data.verified) || 0,
                pending: parseInt(data.pending) || 0,
                attendancePercentage: data.total_candidates > 0 ? Math.round((data.present / data.total_candidates) * 100) : 0,
                verificationPercentage: data.total_candidates > 0 ? Math.round((data.verified / data.total_candidates) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Reports error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'dynamic-dashboard' });
});

// ============================================================================
// SERVE DASHBOARD UI
// ============================================================================

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dynamic-dashboard.html'));
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

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
    console.log(`║        DYNAMIC DASHBOARD SERVER - EXAM-WISE FILTERING         ║`);
    console.log(`╚════════════════════════════════════════════════════════════════╝`);
    console.log(`\n✅ Dashboard Server running on port ${PORT}`);
    console.log(`📍 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
    console.log(`\n`);
});

module.exports = app;
