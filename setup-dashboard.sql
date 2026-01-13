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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_credentials_username ON dashboard_credentials(username);
CREATE INDEX IF NOT EXISTS idx_dashboard_credentials_exam_id ON dashboard_credentials(exam_id);

-- Insert sample credentials for testing
-- First, check if exams exist and insert credentials
INSERT INTO dashboard_credentials (exam_id, exam_name, username, password)
SELECT id, exam_name, 
  CONCAT('exam_', LOWER(REPLACE(exam_name, ' ', '_')), '_user'),
  CONCAT('exam_', LOWER(REPLACE(exam_name, ' ', '_')), '_pass')
FROM exams
WHERE id NOT IN (SELECT exam_id FROM dashboard_credentials)
ON CONFLICT (exam_id) DO NOTHING;

-- If no exams exist, insert sample data
INSERT INTO dashboard_credentials (exam_id, exam_name, username, password)
VALUES 
  (1, 'Exam A', 'exam_a_user', 'exam_a_pass'),
  (2, 'Exam B', 'exam_b_user', 'exam_b_pass'),
  (3, 'Mock Exam 1', 'mock_1_user', 'mock_1_pass')
ON CONFLICT (exam_id) DO NOTHING;

-- Verify data was inserted
SELECT * FROM dashboard_credentials;
