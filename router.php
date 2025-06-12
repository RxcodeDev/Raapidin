<?php
declare(strict_types=1);
require_once __DIR__ . '/autoload.php';

final class Router
{
    private array $routes;
    private string $method;
    private string $uri;

    public function __construct(array $routes)
    {
        $this->routes = $routes;
        $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $this->uri = $this->normalizeUri(
            parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/'
        );
    }

    private function normalizeUri(string $uri): string
    {
        $publicIndex = '/public/index.php';
        if (str_starts_with($uri, $publicIndex)) {
            $uri = substr($uri, strlen($publicIndex));
            return $uri === '' ? '/' : $uri;
        }
        return $uri;
    }

    public function dispatch(): void
    {
        // Exact match
        $routeKey = "{$this->method} {$this->uri}";
        if (isset($this->routes[$routeKey])) {
            $this->invoke($this->routes[$routeKey]);
            return;
        }

        // Dynamic match
        foreach ($this->routes as $route => $handler) {
            [$routeMethod, $routePattern] = explode(' ', $route, 2);
            if ($routeMethod !== $this->method) {
                continue;
            }
            $regex = preg_replace('#\{[^/]+\}#', '([^/]+)', $routePattern);
            $regex = '#^' . $regex . '$#';
            if (preg_match($regex, $this->uri, $matches)) {
                array_shift($matches);
                $this->invoke($handler, $matches);
                return;
            }
        }

        // Not found
        http_response_code(404);
        echo "Ruta no encontrada.";
    }

    private function invoke(array $handler, array $params = []): void
    {
        [$controllerClass, $methodName] = $handler;
        $controller = new $controllerClass();
        echo call_user_func_array([$controller, $methodName], $params);
    }
}

$routes = require __DIR__ . '/routes/routes.php';
$router = new Router($routes);
$router->dispatch();
?>