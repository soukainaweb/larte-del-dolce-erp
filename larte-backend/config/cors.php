<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Allowed origins are driven by environment variables so production
    | frontend URLs can be configured without code changes.
    |
    | FRONTEND_URL          — primary SPA origin (e.g. https://your-app.onrender.com)
    | CORS_ALLOWED_ORIGINS  — optional comma-separated list (overrides FRONTEND_URL)
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(
        env('CORS_ALLOWED_ORIGINS')
            ? array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS')))
            : (env('FRONTEND_URL') ? [trim(env('FRONTEND_URL'))] : ['*'])
    )),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
