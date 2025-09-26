<?php 
declare(strict_types=1);
require_once __DIR__ . '/../autoload.php';

use App\Router\Router;

$router = new Router();

// Cargar rutas desde archivo
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
            default => null
        };
    }
}

$router->dispatch();