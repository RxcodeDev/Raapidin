<?php 
declare(strict_types=1);
require_once __DIR__ . '/../autoload.php';

use App\Router\Router;

// Configurar headers CORS manualmente
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Crear instancia del router
$router = new Router();

// Cargar y registrar las rutas API
$routes = require __DIR__ . '/../routes/api.php';
foreach ($routes as $route => $handler) {
    $parts = explode(' ', $route, 2);
    if (count($parts) === 2) {
        [$method, $path] = $parts;
        match (strtoupper($method)) {
            'GET' => $router->get($path, $handler),
            'POST' => $router->post($path, $handler),
            'PUT' => $router->put($path, $handler),
            'DELETE' => $router->delete($path, $handler),
            'PATCH' => $router->patch($path, $handler),
            default => null
        };
    }
}

// Despachar la petición
$router->dispatch();