#!/bin/bash

echo "🚀 MPA Dashboard Quick Deploy"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing..."
    sudo yum update -y
    sudo yum install nodejs npm -y
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Create package.json
echo "📝 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "exam-dashboard",
  "version": "1.0.0",
  "description": "Real-time Exam Dashboard",
  "main": "dashboard-server.js",
  "scripts": {
    "start": "node dashboard-server.js",
    "dev": "node dashboard-server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create dashboard-server.js if not exists
if [ ! -f "dashboard-server.js" ]; then
    echo "📝 Creating dashboard-server.js..."
    cat > dashboard-server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname)));

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'exam-dashboard-v2.html'));
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
                    <li><a href="/admin">Admin Panel</a> - Manage exams</li>
                    <li><a href="/dashboard">Exam Dashboard</a> - View live data</li>
                </ul>
            </body>
        </html>
    `);
});

app.listen(8080, '0.0.0.0', () => {
    console.log('✅ Dashboard running on http://0.0.0.0:8080');
    console.log('📊 Admin Panel: http://0.0.0.0:8080/admin');
    console.log('📈 Exam Dashboard: http://0.0.0.0:8080/dashboard');
});
EOF
fi

# Check if required files exist
if [ ! -f "exam-dashboard-v2.html" ]; then
    echo "❌ exam-dashboard-v2.html not found!"
    exit 1
fi

if [ ! -f "index.html" ]; then
    echo "❌ index.html not found!"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Starting dashboard server..."
echo ""
echo "📍 Access URLs:"
echo "   Home: http://localhost:8080"
echo "   Admin Panel: http://localhost:8080/admin"
echo "   Exam Dashboard: http://localhost:8080/dashboard"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm start
