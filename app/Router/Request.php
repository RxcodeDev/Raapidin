<?php

declare(strict_types=1);

namespace App\Router;

final class Request
{
    private array $params = [];
    private array $query;
    private array $body;
    private string $method;
    private string $uri;

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $requestUri = $_SERVER['REQUEST_URI'] ?? '/';
        $this->uri = parse_url($requestUri, PHP_URL_PATH) ?? '/';
        $this->query = $_GET;
        $this->body = $this->parseBody();
    }

    private function parseBody(): array
    {
        if (in_array($this->method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            if (str_contains($contentType, 'application/json')) {
                $input = file_get_contents('php://input');
                return json_decode($input, true) ?? [];
            }
            
            if ($this->method === 'POST') {
                return $_POST;
            }
            
            // Para PUT, PATCH, DELETE también parseamos el input
            $input = file_get_contents('php://input');
            if ($input) {
                parse_str($input, $data);
                return $data;
            }
        }
        return [];
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getUri(): string
    {
        return $this->uri;
    }

    public function getParams(): array
    {
        return $this->params;
    }

    public function setParams(array $params): void
    {
        $this->params = $params;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->query[$key] ?? $default;
    }

    public function post(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    public function param(string $key, mixed $default = null): mixed
    {
        return $this->params[$key] ?? $default;
    }

    public function getParam(string $key, mixed $default = null): mixed
    {
        return $this->params[$key] ?? $default;
    }

    public function getBody(): array
    {
        return $this->body;
    }

    public function getQuery(): array
    {
        return $this->query;
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $this->query[$key] ?? $default;
    }

    public function all(): array
    {
        return array_merge($this->query, $this->body, $this->params);
    }
}