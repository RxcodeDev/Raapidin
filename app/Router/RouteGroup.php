<?php

declare(strict_types=1);

namespace App\Router;

use App\Router\Contracts\RouterInterface;

final class RouteGroup
{
    private RouterInterface $router;
    private string $prefix;
    private array $middleware = [];

    public function __construct(RouterInterface $router, string $prefix = '')
    {
        $this->router = $router;
        $this->prefix = rtrim($prefix, '/');
    }

    public function prefix(string $prefix): self
    {
        return new self($this->router, $this->prefix . '/' . trim($prefix, '/'));
    }

    public function get(string $path, array $handler): void
    {
        $this->router->get($this->prefix . $path, $handler);
    }

    public function post(string $path, array $handler): void
    {
        $this->router->post($this->prefix . $path, $handler);
    }

    public function put(string $path, array $handler): void
    {
        $this->router->put($this->prefix . $path, $handler);
    }

    public function delete(string $path, array $handler): void
    {
        $this->router->delete($this->prefix . $path, $handler);
    }
}