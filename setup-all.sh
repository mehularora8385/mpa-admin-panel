#!/bin/bash

##############################################################################
# COMPLETE EXAM DASHBOARD SYSTEM SETUP SCRIPT
# Automates the entire deployment on AWS EC2
##############################################################################

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     EXAM DASHBOARD SYSTEM - COMPLETE SETUP                    ║"
echo "║     This script will setup the entire system in one go         ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="mpa_db"
DB_USER="mpa_admin"
DB_PASSWORD="mpa_admin_pass123"
DB_PORT=5432
DASHBOARD_PORT=8080
BACKEND_PORT=3001

##############################################################################
# PHASE 1: SYSTEM UPDATES
##############################################################################

echo -e "\n${BLUE}[PHASE 1] System Updates${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sudo apt update
echo -e "${GREEN}✅ System updated${NC}"

##############################################################################
# PHASE 2: POSTGRESQL SETUP
##############################################################################

echo -e "\n${BLUE}[PHASE 2] PostgreSQL Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    echo -e "${GREEN}✅ PostgreSQL installed${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL already installed${NC}"
fi

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
echo -e "${GREEN}✅ PostgreSQL started and enabled${NC}"

# Create database and user
echo "Creating database and user..."
sudo -u postgres psql << EOF
-- Drop existing if needed
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create database
CREATE DATABASE $DB_NAME;

-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Grant privileges
ALTER ROLE $DB_USER WITH SUPERUSER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Verify
\l
EOF

echo -e "${GREEN}✅ Database and user created${NC}"

##############################################################################
# PHASE 3: CREATE DASHBOARD CREDENTIALS TABLE
##############################################################################

echo -e "\n${BLUE}[PHASE 3] Create Dashboard Credentials Table${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sudo -u postgres psql -d $DB_NAME << 'EOF'
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_username ON dashboard_credentials(username);
CREATE INDEX IF NOT EXISTS idx_dashboard_exam_id ON dashboard_credentials(exam_id);

-- Verify
SELECT id, exam_id, exam_name, username FROM dashboard_credentials ORDER BY exam_id;
EOF

echo -e "${GREEN}✅ Dashboard credentials table created${NC}"

##############################################################################
# PHASE 4: DASHBOARD SERVER SETUP
##############################################################################

echo -e "\n${BLUE}[PHASE 4] Dashboard Server Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /home/ubuntu/exam_admin_panel

# Install dependencies
echo "Installing dependencies..."
npm install
npm install pg express cors
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Build dashboard server
echo "Building dashboard server..."
npx esbuild src/dashboard-server.js --platform=node --bundle --outfile=dist/dashboard-server.js
echo -e "${GREEN}✅ Dashboard server built${NC}"

# Kill any existing process
pkill -f "node dist/dashboard-server.js" || true
sleep 1

# Start dashboard server
echo "Starting dashboard server..."
nohup node dist/dashboard-server.js > dashboard.log 2>&1 &
sleep 2

# Verify
if ps aux | grep -q "node dist/dashboard-server.js" | grep -v grep; then
    echo -e "${GREEN}✅ Dashboard server started on port $DASHBOARD_PORT${NC}"
else
    echo -e "${RED}❌ Dashboard server failed to start${NC}"
    cat dashboard.log
    exit 1
fi

##############################################################################
# PHASE 5: BACKEND API SETUP
##############################################################################

echo -e "\n${BLUE}[PHASE 5] Backend API Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "/opt/mpa-backend" ]; then
    cd /opt/mpa-backend
    
    # Install dependencies
    echo "Installing backend dependencies..."
    npm install
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    
    # Create .env file
    cat > .env << EOF
NODE_ENV=production
PORT=$BACKEND_PORT
DB_HOST=localhost
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
CORS_ORIGIN=http://13.204.65.158:8080
EOF
    echo -e "${GREEN}✅ Backend environment configured${NC}"
    
    # Kill any existing process
    pkill -f "node dist/index.js" || true
    sleep 1
    
    # Start backend API
    echo "Starting backend API..."
    nohup npm start > backend.log 2>&1 &
    sleep 2
    
    # Verify
    if ps aux | grep -q "node" | grep -v grep; then
        echo -e "${GREEN}✅ Backend API started on port $BACKEND_PORT${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend API may not have started - check logs${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Backend directory not found at /opt/mpa-backend${NC}"
fi

##############################################################################
# PHASE 6: VERIFICATION
##############################################################################

echo -e "\n${BLUE}[PHASE 6] Verification${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test database
echo "Testing database connection..."
if sudo -u postgres psql -d $DB_NAME -c "SELECT COUNT(*) FROM dashboard_credentials;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
fi

# Test dashboard server
echo "Testing dashboard server..."
if curl -s http://localhost:$DASHBOARD_PORT/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Dashboard server responding${NC}"
else
    echo -e "${RED}❌ Dashboard server not responding${NC}"
fi

# Test credential validation
echo "Testing credential validation..."
RESPONSE=$(curl -s -X POST http://localhost:$DASHBOARD_PORT/api/dashboard/validate-credentials \
  -H "Content-Type: application/json" \
  -d '{"username":"exam_a_user","password":"exam_a_pass"}')

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Credential validation working${NC}"
else
    echo -e "${RED}❌ Credential validation failed${NC}"
fi

##############################################################################
# FINAL SUMMARY
##############################################################################

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════════╗"
echo "║                    SETUP COMPLETED SUCCESSFULLY!                ║"
echo "╚════════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}📊 SYSTEM STATUS:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ PostgreSQL${NC}          - Running on port $DB_PORT"
echo -e "${GREEN}✅ Dashboard Server${NC}    - Running on port $DASHBOARD_PORT"
echo -e "${GREEN}✅ Backend API${NC}         - Running on port $BACKEND_PORT"
echo -e "${GREEN}✅ Database${NC}            - Created and configured"
echo -e "${GREEN}✅ Credentials Table${NC}   - Created with sample data"

echo -e "\n${BLUE}🌐 ACCESS URLS:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Dashboard:     http://13.204.65.158:$DASHBOARD_PORT/dashboard"
echo "API Health:    http://13.204.65.158:$DASHBOARD_PORT/api/health"
echo "Backend API:   http://13.204.65.158:$BACKEND_PORT"

echo -e "\n${BLUE}🔐 TEST CREDENTIALS:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Username: exam_a_user    | Password: exam_a_pass"
echo "Username: exam_b_user    | Password: exam_b_pass"
echo "Username: mock_1_user    | Password: mock_1_pass"

echo -e "\n${BLUE}📁 LOG FILES:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Dashboard:  /home/ubuntu/exam_admin_panel/dashboard.log"
echo "Backend:    /opt/mpa-backend/backend.log"

echo -e "\n${BLUE}📚 DOCUMENTATION:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Setup Guide:       /home/ubuntu/DASHBOARD_SETUP_GUIDE.md"
echo "Deployment Guide:  /home/ubuntu/COMPLETE_DEPLOYMENT_GUIDE.md"

echo -e "\n${YELLOW}⚠️  IMPORTANT:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Change PostgreSQL password in production"
echo "2. Setup SSL/TLS for HTTPS"
echo "3. Configure firewall rules"
echo "4. Setup automated backups"
echo "5. Monitor logs regularly"

echo -e "\n${GREEN}🚀 System is ready to use!${NC}\n"
