<?php

declare(strict_types=1);

namespace App\Router\Contracts;

interface MiddlewareInterface
{
    public function handle(array $request, callable $next): mixed;
}