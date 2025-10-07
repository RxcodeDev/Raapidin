<?php

namespace App\Middlewares;

use App\Router\Contracts\MiddlewareInterface;

class CorsMiddleware implements MiddlewareInterface
{
    public function handle(array $request, callable $next): mixed
    {
        // Configurar headers CORS
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Max-Age: 86400');

        // Manejar preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        return $next($request);
    }
}