<?php

declare(strict_types=1);

namespace App\Router\Contracts;

interface ResponseInterface
{
    public function json(array $data, int $statusCode = 200): void;
    public function text(string $content, int $statusCode = 200): void;
    public function status(int $code): self;
}