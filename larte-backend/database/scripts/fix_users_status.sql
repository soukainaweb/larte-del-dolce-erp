-- Fix login error: Data truncated for column 'status'
-- Run this in phpMyAdmin on database: larte_erp

ALTER TABLE users
  MODIFY status VARCHAR(20) NOT NULL DEFAULT 'offline';

-- Verify
-- SHOW COLUMNS FROM users LIKE 'status';
