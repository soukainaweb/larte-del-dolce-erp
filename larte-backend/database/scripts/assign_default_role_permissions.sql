-- Bootstrap permissions and assign them to all roles.
-- Prefer running: php artisan permissions:sync-defaults

INSERT INTO permissions (name, display_name, module, status, guard_name, created_at, updated_at)
SELECT 'dashboard.view', 'View Dashboard', 'dashboard', 'active', 'web', NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'dashboard.view');

INSERT INTO permissions (name, display_name, module, status, guard_name, created_at, updated_at)
SELECT 'notifications.view', 'View Notifications', 'notifications', 'active', 'web', NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'notifications.view');

INSERT IGNORE INTO permission_role (permission_id, role_id)
SELECT p.id, r.id
FROM permissions p
CROSS JOIN roles r
WHERE p.name IN ('dashboard.view', 'notifications.view');

INSERT IGNORE INTO permission_role (permission_id, role_id)
SELECT p.id, r.id
FROM permissions p
JOIN roles r ON r.name = 'admin';
