const express = require('express');
const path = require('path');
const http = require('http');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API Proxy - Forward requests to backend API
app.use('/api/', (req, res) => {
    const apiUrl = `http://localhost:3001${req.url}`;
    
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: req.url,
        method: req.method,
        headers: {
            ...req.headers,
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
        console.error('Proxy error:', error);
        res.status(503).json({ error: 'Backend API unavailable' });
    });

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        req.pipe(proxyReq);
    } else {
        proxyReq.end();
    }
});

// Dashboard routes
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'exam-dashboard-v7.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/', (req, res) => {
    res.send(`
        <html>
            <body style="font-family: Arial; padding: 40px; background: #f0f2f5;">
                <h1>📊 MPA Biometric System</h1>
                <p>Select an option:</p>
                <ul style="font-size: 18px; line-height: 2;">
                    <li><a href="/admin">Admin Panel</a> - Manage exams and dashboards</li>
                    <li><a href="/dashboard">Exam Dashboard</a> - View live exam data</li>
                </ul>
            </body>
        </html>
    `);
});

const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ Dashboard server running on http://13.204.65.158:' + PORT);
    console.log('📊 Dashboard: http://13.204.65.158:' + PORT + '/dashboard');
    console.log('🔌 API Proxy: http://13.204.65.158:' + PORT + '/api/*');
});
