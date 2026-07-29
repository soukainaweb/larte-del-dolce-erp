-- Assign baseline permissions to all roles (dashboard + notifications).
-- Run after permissions and roles exist. Safe to re-run.

INSERT IGNORE INTO permission_role (permission_id, role_id)
SELECT p.id, r.id
FROM permissions p
CROSS JOIN roles r
WHERE p.name IN ('dashboard.view', 'notifications.view');

-- Ensure admin has every permission
INSERT IGNORE INTO permission_role (permission_id, role_id)
SELECT p.id, r.id
FROM permissions p
JOIN roles r ON r.name = 'admin';
