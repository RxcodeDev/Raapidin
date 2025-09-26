<?php

declare(strict_types=1);

namespace App\Router;

use App\Router\Contracts\RouterInterface;
use App\Router\Contracts\MiddlewareInterface;
use App\ExceptionsPheonix\Exceptions;
use App\ExceptionsPheonix\ValidationException;
use App\ExceptionsPheonix\ConfigurationException;
use Throwable;

final class Router implements RouterInterface
{
    private array $routes = [];
    private array $middleware = [];
    private Request $request;
    private Response $response;

    public function __construct()
    {
        $this->request = new Request();
        $this->response = new Response();
    }

    public function get(string $path, array $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, array $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, array $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, array $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    public function middleware(MiddlewareInterface $middleware): self
    {
        $this->middleware[] = $middleware;
        return $this;
    }

    private function addRoute(string $method, string $path, array $handler): void
    {
        $this->validateHandler($handler);
        $this->routes["$method $path"] = $handler;
    }

    private function validateHandler(array $handler): void
    {
        if (count($handler) !== 2) {
            throw new ValidationException("Handler must contain exactly 2 elements: [class, method]");
        }
        
        [$class, $method] = $handler;
        
        if (!is_string($class) || !is_string($method)) {
            throw new ValidationException("Handler must contain class and method strings");
        }
        
        if (empty($class) || empty($method)) {
            throw new ValidationException("Class and method cannot be empty");
        }
    }

    private function normalizeUri(string $uri): string
    {
        $publicIndex = '/public/index.php';
        if (str_starts_with($uri, $publicIndex)) {
            $uri = substr($uri, strlen($publicIndex));
            return $uri === '' ? '/' : $uri;
        }
        return rtrim($uri, '/') ?: '/';
    }

    public function dispatch(): void
    {
        try {
            $uri = $this->normalizeUri($this->request->getUri());
            $method = $this->request->getMethod();
            $routeKey = "$method $uri";

            if (isset($this->routes[$routeKey])) {
                $this->handleRoute($this->routes[$routeKey]);
                return;
            }

            foreach ($this->routes as $route => $handler) {
                $parts = explode(' ', $route, 2);
                if (count($parts) !== 2) continue;

                [$routeMethod, $routePattern] = $parts;
                if ($routeMethod !== $method) continue;

                $params = $this->matchRoute($routePattern, $uri);
                if ($params !== null) {
                    $this->request->setParams($params);
                    $this->handleRoute($handler);
                    return;
                }
            }

            // Si no encuentra la ruta, lanzar excepción para que use tu plantilla
            throw new ConfigurationException('Route not found: ' . $method . ' ' . $uri);
            
        } catch (Throwable $exception) {
            Exceptions::handleException($exception);
        }
    }

    private function matchRoute(string $pattern, string $uri): ?array
    {
        $regex = '#^' . preg_replace('#\{([^/]+)\}#', '(?P<$1>[^/]+)', $pattern) . '$#';
        
        if (preg_match($regex, $uri, $matches)) {
            return array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
        }
        
        return null;
    }

    private function handleRoute(array $handler): void
    {
        $next = fn() => $this->invoke($handler);
        
        $pipeline = array_reduce(
            array_reverse($this->middleware),
            fn($next, $middleware) => fn() => $middleware->handle($this->request->all(), $next),
            $next
        );
        
        $pipeline();
    }

    private function invoke(array $handler): void
    {
        [$controllerClass, $methodName] = $handler;
        
        if (!class_exists($controllerClass)) {
            throw new ConfigurationException("Controller class not found: $controllerClass");
        }
        
        $controller = new $controllerClass();
        
        if (!method_exists($controller, $methodName)) {
            throw new ConfigurationException("Method not found: $controllerClass::$methodName");
        }
        
        $controller->$methodName($this->request, $this->response);
    }
}