<?php

declare(strict_types=1);

namespace App\Controllers\Base;

use App\Router\Request;
use App\Router\Response;

abstract class BaseController
{
    protected Request $request;
    protected Response $response;

    public function __construct()
    {
        $this->request = new Request();
        $this->response = new Response();
    }

    protected function jsonResponse(array $data, int $statusCode = 200): void
    {
        $this->response->json($data, $statusCode);
    }

    protected function errorResponse(string $message, int $statusCode = 400): void
    {
        $this->response->json(['error' => $message], $statusCode);
    }

    protected function successResponse(mixed $data = null, string $message = 'Success'): void
    {
        $response = ['success' => true, 'message' => $message];
        if ($data !== null) {
            $response['data'] = $data;
        }
        $this->response->json($response);
    }
}