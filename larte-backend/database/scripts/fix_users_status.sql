-- Manual fix: users.status truncation on login (MySQL / phpMyAdmin)
-- Database: larte_erp
--
-- Run once. Safe to re-run (no-op if already VARCHAR(50)).

ALTER TABLE users
  MODIFY status VARCHAR(50) NOT NULL DEFAULT 'offline';

-- Verify:
-- SHOW COLUMNS FROM users LIKE 'status';
-- Expected: Type = varchar(50), Default = offline

-- Optional: inspect current values
-- SELECT id, email, status FROM users;
