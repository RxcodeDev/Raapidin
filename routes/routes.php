<?php
return [
    'GET /' => ['App\Controllers\HomeControllers', 'index'],
    'GET /saludo' => ['App\Controllers\HomeControllers', 'saludar'],
    'GET /supplies' => ['App\Models\Supplies', 'supplies'],
    'POST /supplies' => ['App\Models\Supplies', 'create'],
];
?>