<?php
return [
    'GET /' => ['App\Controllers\HomeControllers', 'index'],
    'GET /saludo' => ['App\Controllers\HomeControllers', 'saludar'],
    'GET /supplies' => ['App\Models\Supplies', 'getAll'],
    'POST /supplies' => ['App\Models\Supplies', 'create'],
    'GET /supplies/field/{field}' => ['App\Models\Supplies', 'getFieldValues'],
];
?>