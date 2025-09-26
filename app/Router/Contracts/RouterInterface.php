<?php

declare(strict_types=1);

namespace App\Router\Contracts;

interface RouterInterface
{
    public function get(string $path, array $handler): void;
    public function post(string $path, array $handler): void;
    public function put(string $path, array $handler): void;
    public function delete(string $path, array $handler): void;
    public function dispatch(): void;
}