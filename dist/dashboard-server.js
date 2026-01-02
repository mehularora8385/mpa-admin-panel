const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname)));

// Dashboard routes
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'exam-dashboard-v7.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/', (req, res) => {
    res.send('<html><body style="font-family: Arial; padding: 40px; background: #f0f2f5;"><h1>MPA Biometric System</h1><p>Select an option:</p><ul style="font-size: 18px; line-height: 2;"><li><a href="/admin">Admin Panel</a> - Manage exams and dashboards</li><li><a href="/dashboard">Exam Dashboard</a> - View live exam data</li></ul></body></html>');
});

const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log('Dashboard server running on http://13.204.65.158:' + PORT);
});
