<?php

declare(strict_types=1);

namespace App\Router;

use App\Router\Contracts\ResponseInterface;

final class Response implements ResponseInterface
{
    private int $statusCode = 200;

    public function json(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_THROW_ON_ERROR);
        exit;
    }

    public function text(string $content, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: text/plain');
        echo $content;
        exit;
    }

    public function status(int $code): self
    {
        $this->statusCode = $code;
        return $this;
    }
}