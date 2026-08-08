<?php

/**
 * Central registry for entity-created in-app notifications.
 *
 * Recipient rules use role slugs and/or permission names — never hardcoded user IDs.
 * Add new modules here when new CREATE endpoints are introduced.
 */
return [
    'customer' => [
        'type' => 'customer',
        'title' => 'عميل جديد',
        'intro' => 'تمت إضافة عميل جديد',
        'route' => '/dashboard/customers/{id}',
        'name_field' => 'name',
        'recipients' => [
            'roles' => ['manager', 'admin'],
            'permissions' => ['customers.view'],
        ],
    ],

    'product' => [
        'type' => 'product',
        'title' => 'منتج جديد',
        'intro' => 'تمت إضافة منتج جديد',
        'route' => '/dashboard/products/{id}',
        'name_field' => 'name',
        'number_field' => 'sku',
        'recipients' => [
            'roles' => ['manager', 'admin'],
            'permissions' => ['products.view', 'inventory.view'],
        ],
    ],

    'category' => [
        'type' => 'category',
        'title' => 'تصنيف جديد',
        'intro' => 'تمت إضافة تصنيف جديد',
        'route' => '/dashboard/categories/{id}',
        'name_field' => 'name',
        'recipients' => [
            'roles' => ['manager', 'admin'],
            'permissions' => ['categories.view'],
        ],
    ],

    'user' => [
        'type' => 'user',
        'title' => 'مستخدم جديد',
        'intro' => 'تمت إضافة مستخدم جديد',
        'route' => '/dashboard/users/{id}',
        'name_field' => 'email',
        'recipients' => [
            'roles' => ['manager', 'admin'],
            'permissions' => ['users.view'],
        ],
    ],

    'supplier' => [
        'type' => 'supplier',
        'title' => 'مورد جديد',
        'intro' => 'تمت إضافة مورد جديد',
        'route' => '/dashboard/suppliers/{id}',
        'name_field' => 'name',
        'recipients' => [
            'roles' => ['manager', 'admin'],
            'permissions' => ['suppliers.view', 'purchases.view'],
        ],
    ],

    'production' => [
        'type' => 'production',
        'title' => 'عملية إنتاج جديدة',
        'intro' => 'تم إنشاء عملية إنتاج جديدة',
        'route' => '/dashboard/production/{id}',
        'name_field' => 'name',
        'number_field' => 'production_number',
        'recipients' => [
            'roles' => ['manager', 'admin'],
            'permissions' => ['productions.view'],
            'assignee_field' => 'assigned_to',
        ],
    ],

    'warehouse' => [
        'type' => 'warehouse',
        'title' => 'مستودع جديد',
        'intro' => 'تمت إضافة مستودع جديد',
        'route' => '/dashboard/warehouse/{id}',
        'name_field' => 'name',
        'recipients' => [
            'roles' => ['manager', 'admin'],
            'permissions' => ['warehouses.view', 'inventory.view'],
            'assignee_field' => 'manager_id',
        ],
    ],

    'inventory' => [
        'type' => 'stock',
        'title' => 'سجل مخزون جديد',
        'intro' => 'تمت إضافة سجل مخزون جديد',
        'route' => '/dashboard/inventory',
        'name_field' => 'id',
        'recipients' => [
            'roles' => ['manager', 'admin'],
            'permissions' => ['inventory.view'],
        ],
    ],

    'payment' => [
        'type' => 'payment',
        'title' => 'دفعة جديدة',
        'intro' => 'تمت إضافة دفعة جديدة',
        'route' => '/dashboard/payments/{id}',
        'number_field' => 'reference',
        'recipients' => [
            'roles' => ['manager', 'admin', 'accountant'],
            'permissions' => ['payments.view', 'finance.view'],
        ],
    ],

    'expense' => [
        'type' => 'expense',
        'title' => 'مصروف جديد',
        'intro' => 'تمت إضافة مصروف جديد',
        'route' => '/dashboard/expenses/{id}',
        'name_field' => 'description',
        'recipients' => [
            'roles' => ['manager', 'admin', 'accountant'],
            'permissions' => ['expenses.view', 'finance.view'],
        ],
    ],

    'invoice' => [
        'type' => 'invoice',
        'title' => 'فاتورة جديدة',
        'intro' => 'تم إنشاء فاتورة جديدة',
        'route' => '/dashboard/invoices/{id}',
        'number_field' => 'invoice_number',
        'recipients' => [
            'roles' => ['manager', 'admin', 'accountant'],
            'permissions' => ['finance.view'],
        ],
    ],

    'delivery' => [
        'type' => 'delivery',
        'title' => 'تسليم جديد',
        'intro' => 'تم إنشاء تسليم جديد',
        'route' => '/dashboard/deliveries/{id}',
        'number_field' => 'delivery_number',
        'recipients' => [
            'roles' => ['manager', 'admin'],
            'permissions' => ['deliveries.view'],
            'assignee_field' => 'driver_id',
        ],
    ],

    'purchase' => [
        'type' => 'purchase',
        'title' => 'عملية شراء جديدة',
        'intro' => 'تمت إضافة عملية شراء جديدة',
        'route' => '/dashboard/purchases/{id}',
        'name_field' => 'material_name',
        'number_field' => 'purchase_number',
        'recipients' => [
            'roles' => ['manager', 'admin'],
            'permissions' => ['purchases.view', 'suppliers.view'],
        ],
    ],

    'waste_return' => [
        'type' => 'waste_return',
        'title' => 'سجل هدر/إرجاع جديد',
        'intro' => 'تمت إضافة سجل هدر/إرجاع جديد',
        'route' => '/dashboard/waste-returns/{id}',
        'number_field' => 'reference',
        'recipients' => [
            'roles' => ['manager', 'admin', 'accountant'],
            'permissions' => ['waste_returns.view', 'inventory.view'],
        ],
    ],

    'role' => [
        'type' => 'role',
        'title' => 'دور جديد',
        'intro' => 'تمت إضافة دور جديد',
        'route' => '/dashboard/roles/{id}',
        'name_field' => 'display_name',
        'recipients' => [
            'roles' => ['admin'],
            'permissions' => ['roles.view'],
        ],
    ],

    'permission' => [
        'type' => 'permission',
        'title' => 'صلاحية جديدة',
        'intro' => 'تمت إضافة صلاحية جديدة',
        'route' => '/dashboard/roles',
        'name_field' => 'display_name',
        'recipients' => [
            'roles' => ['admin'],
            'permissions' => ['permissions.view'],
        ],
    ],

    'meeting' => [
        'type' => 'meeting',
        'title' => 'اجتماع جديد',
        'intro' => 'تم إنشاء اجتماع جديد',
        'route' => '/dashboard/meetings/{id}',
        'name_field' => 'title',
        'recipients' => [
            'roles' => ['manager', 'admin'],
            'permissions' => ['meetings.view'],
        ],
        'include_invitees' => true,
    ],

    'vehicle' => [
        'type' => 'delivery',
        'title' => 'مركبة جديدة',
        'intro' => 'تمت إضافة مركبة جديدة',
        'route' => '/dashboard/deliveries',
        'name_field' => 'plate_number',
        'recipients' => [
            'roles' => ['manager', 'admin'],
            'permissions' => ['deliveries.view'],
        ],
    ],
];
