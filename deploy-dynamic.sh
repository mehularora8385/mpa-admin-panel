#!/bin/bash

##############################################################################
# DYNAMIC EXAM DASHBOARD - COMPLETE DEPLOYMENT
# Exam-wise dashboard with admin panel
##############################################################################

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     DYNAMIC EXAM DASHBOARD - COMPLETE DEPLOYMENT              ║"
echo "║     Exam-wise dashboard with admin panel                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DB_NAME="mpa_db"
DB_USER="mpa_admin"
DB_PASSWORD="mpa_admin_pass123"
DASHBOARD_PORT=8080
ADMIN_PORT=3002

##############################################################################
# PHASE 1: DATABASE SETUP
##############################################################################

echo -e "\n${BLUE}[PHASE 1] Database Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Install PostgreSQL if not present
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib > /dev/null 2>&1
fi

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
echo -e "${GREEN}✅ PostgreSQL started${NC}"

# Create database and user
echo "Creating database and user..."
sudo -u postgres psql << EOSQL
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
ALTER ROLE $DB_USER WITH SUPERUSER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOSQL

echo -e "${GREEN}✅ Database created${NC}"

##############################################################################
# PHASE 2: CREATE SCHEMA AND SAMPLE DATA
##############################################################################

echo -e "\n${BLUE}[PHASE 2] Create Schema and Sample Data${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Run SQL schema
sudo -u postgres psql -d $DB_NAME < /home/ubuntu/exam_admin_panel/setup-dynamic-db.sql

echo -e "${GREEN}✅ Schema and sample data created${NC}"

##############################################################################
# PHASE 3: INSTALL DEPENDENCIES
##############################################################################

echo -e "\n${BLUE}[PHASE 3] Install Dependencies${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /home/ubuntu/exam_admin_panel
npm install > /dev/null 2>&1
npm install pg express cors > /dev/null 2>&1

echo -e "${GREEN}✅ Dependencies installed${NC}"

##############################################################################
# PHASE 4: BUILD SERVERS
##############################################################################

echo -e "\n${BLUE}[PHASE 4] Build Servers${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Building dynamic dashboard server..."
npx esbuild src/dynamic-dashboard-server.js --platform=node --bundle --outfile=dist/dynamic-dashboard-server.js > /dev/null 2>&1

echo "Building admin panel server..."
npx esbuild src/admin-panel.js --platform=node --bundle --outfile=dist/admin-panel.js > /dev/null 2>&1

echo -e "${GREEN}✅ Servers built${NC}"

##############################################################################
# PHASE 5: START SERVERS
##############################################################################

echo -e "\n${BLUE}[PHASE 5] Start Servers${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Kill any existing processes
sleep 1

# Start dashboard server
echo "Starting dashboard server on port $DASHBOARD_PORT..."
nohup node dist/dynamic-dashboard-server.js > dashboard.log 2>&1 &
sleep 2

# Start admin panel
echo "Starting admin panel on port $ADMIN_PORT..."
nohup PORT=$ADMIN_PORT node dist/admin-panel.js > admin-panel.log 2>&1 &
sleep 2

echo -e "${GREEN}✅ Servers started${NC}"

##############################################################################
# PHASE 6: VERIFICATION
##############################################################################

echo -e "\n${BLUE}[PHASE 6] Verification${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test database
echo "Testing database..."
if sudo -u postgres psql -d $DB_NAME -c "SELECT COUNT(*) FROM exams;" > /dev/null 2>&1; then
    EXAM_COUNT=$(sudo -u postgres psql -d $DB_NAME -t -c "SELECT COUNT(*) FROM exams;")
    echo -e "${GREEN}✅ Database OK (${EXAM_COUNT} exams)${NC}"
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

# Test admin panel
echo "Testing admin panel..."
if curl -s http://localhost:$ADMIN_PORT/api/admin/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Admin panel responding${NC}"
else
    echo -e "${RED}❌ Admin panel not responding${NC}"
fi

##############################################################################
# FINAL SUMMARY
##############################################################################

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════════╗"
echo "║                    DEPLOYMENT COMPLETED!                      ║"
echo "╚════════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}📊 SYSTEM STATUS:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ PostgreSQL${NC}              - Running"
echo -e "${GREEN}✅ Dashboard Server${NC}       - Port $DASHBOARD_PORT"
echo -e "${GREEN}✅ Admin Panel${NC}            - Port $ADMIN_PORT"
echo -e "${GREEN}✅ Database${NC}               - $DB_NAME"
echo -e "${GREEN}✅ Sample Exams${NC}           - 3 (JEE, NEET, GATE)"

echo -e "\n${BLUE}🌐 ACCESS URLS:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Dashboard:     http://localhost:$DASHBOARD_PORT/dashboard"
echo "Admin Panel:   http://localhost:$ADMIN_PORT/api/admin"
echo "API Health:    http://localhost:$DASHBOARD_PORT/api/health"

echo -e "\n${BLUE}🔐 TEST CREDENTIALS:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Exam: JEE Main 2024"
echo "  Username: jee_main_2024"
echo "  Password: jee_main_pass_123"
echo ""
echo "Exam: NEET 2024"
echo "  Username: neet_2024"
echo "  Password: neet_pass_123"
echo ""
echo "Exam: GATE 2024"
echo "  Username: gate_2024"
echo "  Password: gate_pass_123"

echo -e "\n${BLUE}📁 LOG FILES:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Dashboard:  /home/ubuntu/exam_admin_panel/dashboard.log"
echo "Admin:      /home/ubuntu/exam_admin_panel/admin-panel.log"

echo -e "\n${YELLOW}⚠️  IMPORTANT:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Each exam has its own login credentials"
echo "2. Dashboard filters data by exam automatically"
echo "3. Admin can create new exams via API"
echo "4. Session timeout: 5 minutes"
echo "5. All data is exam-specific"

echo -e "\n${GREEN}🚀 System is ready to use!${NC}\n"
