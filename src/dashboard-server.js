const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Client
const pgClient = new Client({
    host: 'localhost',
    port: 5432,
    database: 'mpa_db',
    user: 'postgres',
    password: 'postgres'
});

// Fallback credentials (in case database is not available)
const FALLBACK_CREDENTIALS = {
    'exam_a_user': { password: 'exam_a_pass', examId: 1, examName: 'Exam A' },
    'exam_b_user': { password: 'exam_b_pass', examId: 2, examName: 'Exam B' },
    'mock_1_user': { password: 'mock_1_pass', examId: 3, examName: 'Mock Exam 1' }
};

let dbConnected = false;

// Connect to PostgreSQL
async function connectDatabase() {
    try {
        await pgClient.connect();
        dbConnected = true;
        console.log('✅ Connected to PostgreSQL');
    } catch (error) {
        console.warn('⚠️  Could not connect to PostgreSQL:', error.message);
        console.warn('⚠️  Using fallback credentials');
        dbConnected = false;
    }
}

// Validate credentials endpoint
app.post('/api/dashboard/validate-credentials', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    try {
        let result = null;

        // Try database first
        if (dbConnected) {
            try {
                result = await pgClient.query(
                    'SELECT exam_id, exam_name FROM dashboard_credentials WHERE username = $1 AND password = $2',
                    [username, password]
                );
            } catch (dbError) {
                console.warn('Database query failed:', dbError.message);
                // Fall through to fallback
            }
        }

        // If database failed or not connected, use fallback
        if (!result || result.rows.length === 0) {
            const cred = FALLBACK_CREDENTIALS[username];
            if (!cred || cred.password !== password) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
            return res.json({
                success: true,
                examId: cred.examId,
                examName: cred.examName,
                source: 'fallback'
            });
        }

        // Database credentials matched
        const row = result.rows[0];
        return res.json({
            success: true,
            examId: row.exam_id,
            examName: row.exam_name,
            source: 'database'
        });
    } catch (error) {
        console.error('Validation error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Serve dashboard HTML
app.get('/dashboard', (req, res) => {
    const dashboardPath = path.join(__dirname, '../dist/exam-dashboard-v7.html');
    if (fs.existsSync(dashboardPath)) {
        res.sendFile(dashboardPath);
    } else {
        res.status(404).send('Dashboard not found');
    }
});

// Proxy API requests to backend
app.all('/api/*', async (req, res) => {
    const apiPath = req.path.replace('/api', '');
    const backendUrl = `http://localhost:3001${apiPath}`;

    try {
        const response = await fetch(backendUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                ...req.headers
            },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(503).json({ error: 'Backend API unavailable' });
    }
});

// Start server
async function startServer() {
    await connectDatabase();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Dashboard server running on http://13.204.65.158:${PORT}`);
        console.log(`📊 Dashboard: http://13.204.65.158:${PORT}/dashboard`);
        console.log(`🔌 API Proxy: http://13.204.65.158:${PORT}/api/*`);
        console.log(`📊 Health: http://13.204.65.158:${PORT}/api/health`);
        console.log(`\n🔐 Using ${dbConnected ? 'database' : 'fallback'} credentials`);
    });
}

startServer();
