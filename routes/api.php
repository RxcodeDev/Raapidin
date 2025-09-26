<?php

use App\Controllers\TenantController;

return [
    // Rutas para Tenants
    'GET /api/tenants' => [TenantController::class, 'index'],
    'GET /api/tenants/active' => [TenantController::class, 'getActive'],
    'GET /api/tenants/{id}' => [TenantController::class, 'show'],
    'GET /api/tenants/slug/{slug}' => [TenantController::class, 'getBySlug'],
    'POST /api/tenants' => [TenantController::class, 'store'],
    'PUT /api/tenants/{id}' => [TenantController::class, 'update'],
    'PATCH /api/tenants/{id}/status' => [TenantController::class, 'updateStatus'],
];
?>