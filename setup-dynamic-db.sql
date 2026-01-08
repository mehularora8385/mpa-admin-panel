-- ============================================================================
-- EXAM MANAGEMENT DATABASE SCHEMA
-- Dynamic exam-wise dashboard system
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS operators CASCADE;
DROP TABLE IF EXISTS centres CASCADE;
DROP TABLE IF EXISTS dashboard_credentials CASCADE;
DROP TABLE IF EXISTS exams CASCADE;

-- ============================================================================
-- EXAMS TABLE
-- ============================================================================
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    exam_name VARCHAR(255) NOT NULL,
    exam_code VARCHAR(50) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    total_candidates INTEGER DEFAULT 0,
    total_operators INTEGER DEFAULT 0,
    total_centres INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_exam_code ON exams(exam_code);

-- ============================================================================
-- DASHBOARD CREDENTIALS TABLE
-- ============================================================================
CREATE TABLE dashboard_credentials (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL UNIQUE REFERENCES exams(id) ON DELETE CASCADE,
    exam_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dashboard_username ON dashboard_credentials(username);
CREATE INDEX idx_dashboard_exam_id ON dashboard_credentials(exam_id);

-- ============================================================================
-- CANDIDATES TABLE
-- ============================================================================
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    centre_id INTEGER,
    attendance VARCHAR(20) DEFAULT 'absent' CHECK (attendance IN ('present', 'absent')),
    verification VARCHAR(20) DEFAULT 'pending' CHECK (verification IN ('verified', 'pending', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, roll_number)
);

CREATE INDEX idx_candidates_exam_id ON candidates(exam_id);
CREATE INDEX idx_candidates_roll_number ON candidates(roll_number);
CREATE INDEX idx_candidates_attendance ON candidates(attendance);
CREATE INDEX idx_candidates_verification ON candidates(verification);

-- ============================================================================
-- OPERATORS TABLE
-- ============================================================================
CREATE TABLE operators (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    operator_id VARCHAR(50) NOT NULL,
    operator_name VARCHAR(255) NOT NULL,
    centre_id INTEGER,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, operator_id)
);

CREATE INDEX idx_operators_exam_id ON operators(exam_id);
CREATE INDEX idx_operators_status ON operators(status);

-- ============================================================================
-- CENTRES TABLE
-- ============================================================================
CREATE TABLE centres (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    centre_code VARCHAR(50) NOT NULL,
    centre_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    capacity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, centre_code)
);

CREATE INDEX idx_centres_exam_id ON centres(exam_id);
CREATE INDEX idx_centres_centre_code ON centres(centre_code);

-- ============================================================================
-- INSERT SAMPLE DATA
-- ============================================================================

-- Insert sample exams
INSERT INTO exams (exam_name, exam_code, username, password, status, total_candidates, total_operators, total_centres)
VALUES 
    ('JEE Main 2024', 'JEE-2024-01', 'jee_main_2024', 'jee_main_pass_123', 'active', 100, 5, 3),
    ('NEET 2024', 'NEET-2024-01', 'neet_2024', 'neet_pass_123', 'active', 150, 8, 4),
    ('GATE 2024', 'GATE-2024-01', 'gate_2024', 'gate_pass_123', 'active', 80, 4, 2);

-- Insert dashboard credentials
INSERT INTO dashboard_credentials (exam_id, exam_name, username, password)
VALUES 
    (1, 'JEE Main 2024', 'jee_main_2024', 'jee_main_pass_123'),
    (2, 'NEET 2024', 'neet_2024', 'neet_pass_123'),
    (3, 'GATE 2024', 'gate_2024', 'gate_pass_123');

-- Insert sample candidates for JEE
INSERT INTO candidates (exam_id, roll_number, candidate_name, centre_id, attendance, verification)
VALUES 
    (1, 'JEE001', 'Raj Kumar', 1, 'present', 'verified'),
    (1, 'JEE002', 'Priya Singh', 1, 'present', 'verified'),
    (1, 'JEE003', 'Amit Patel', 2, 'absent', 'pending'),
    (1, 'JEE004', 'Neha Sharma', 2, 'present', 'pending'),
    (1, 'JEE005', 'Rohan Verma', 3, 'present', 'verified');

-- Insert sample candidates for NEET
INSERT INTO candidates (exam_id, roll_number, candidate_name, centre_id, attendance, verification)
VALUES 
    (2, 'NEET001', 'Anjali Gupta', 1, 'present', 'verified'),
    (2, 'NEET002', 'Vikram Singh', 1, 'present', 'verified'),
    (2, 'NEET003', 'Pooja Desai', 2, 'absent', 'pending'),
    (2, 'NEET004', 'Arjun Reddy', 2, 'present', 'verified'),
    (2, 'NEET005', 'Sneha Iyer', 3, 'present', 'pending');

-- Insert sample operators for JEE
INSERT INTO operators (exam_id, operator_id, operator_name, centre_id, status)
VALUES 
    (1, 'OP001', 'Operator One', 1, 'active'),
    (1, 'OP002', 'Operator Two', 2, 'active'),
    (1, 'OP003', 'Operator Three', 3, 'active');

-- Insert sample operators for NEET
INSERT INTO operators (exam_id, operator_id, operator_name, centre_id, status)
VALUES 
    (2, 'OP001', 'NEET Operator One', 1, 'active'),
    (2, 'OP002', 'NEET Operator Two', 2, 'active'),
    (2, 'OP003', 'NEET Operator Three', 3, 'active'),
    (2, 'OP004', 'NEET Operator Four', 4, 'active');

-- Insert sample centres for JEE
INSERT INTO centres (exam_id, centre_code, centre_name, location, capacity)
VALUES 
    (1, 'JEE-C001', 'Delhi Centre', 'New Delhi', 50),
    (1, 'JEE-C002', 'Mumbai Centre', 'Mumbai', 40),
    (1, 'JEE-C003', 'Bangalore Centre', 'Bangalore', 35);

-- Insert sample centres for NEET
INSERT INTO centres (exam_id, centre_code, centre_name, location, capacity)
VALUES 
    (2, 'NEET-C001', 'Delhi NEET Centre', 'New Delhi', 60),
    (2, 'NEET-C002', 'Mumbai NEET Centre', 'Mumbai', 50),
    (2, 'NEET-C003', 'Bangalore NEET Centre', 'Bangalore', 45),
    (2, 'NEET-C004', 'Chennai NEET Centre', 'Chennai', 40);

-- ============================================================================
-- VERIFY DATA
-- ============================================================================

SELECT 'Exams' as table_name, COUNT(*) as count FROM exams
UNION ALL
SELECT 'Candidates', COUNT(*) FROM candidates
UNION ALL
SELECT 'Operators', COUNT(*) FROM operators
UNION ALL
SELECT 'Centres', COUNT(*) FROM centres
UNION ALL
SELECT 'Dashboard Credentials', COUNT(*) FROM dashboard_credentials;
