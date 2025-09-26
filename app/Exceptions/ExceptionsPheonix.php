<?php

declare(strict_types=1);

namespace App\ExceptionsPheonix;

use Throwable;
use RuntimeException;
use InvalidArgumentException;
use PDOException;

class AutoloadException extends RuntimeException {}
class ConnectionException extends RuntimeException {}
class ConfigurationException extends RuntimeException {}
class ValidationException extends InvalidArgumentException {}
class DatabaseException extends RuntimeException {}
class AuthenticationException extends RuntimeException {}
class AuthorizationException extends RuntimeException {}
class ServiceUnavailableException extends RuntimeException {}
class RateLimitException extends RuntimeException {}

final class Exceptions
{
    private const CRITICAL_ERROR_TYPES = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR];
    
    private const EXCEPTION_MAP = [
        AutoloadException::class => 'AutoloadException',
        ConnectionException::class => 'ConnectionException',
        ConfigurationException::class => 'ConfigurationException',
        ValidationException::class => 'ValidationException',
        DatabaseException::class => 'DatabaseException',
        AuthenticationException::class => 'AuthenticationException',
        AuthorizationException::class => 'AuthorizationException',
        ServiceUnavailableException::class => 'ServiceUnavailableException',
        RateLimitException::class => 'RateLimitException',
        PDOException::class => 'DatabaseException',
    ];

    private const HTTP_STATUS_MAP = [
        ValidationException::class => 400,
        AuthenticationException::class => 401,
        AuthorizationException::class => 403,
        ConfigurationException::class => 404,
        DatabaseException::class => 500,
        ServiceUnavailableException::class => 503,
        RateLimitException::class => 429,
        PDOException::class => 500,
    ];

    public static function handleException(Throwable $exception): void
    {
        $isApiRequest = self::isApiRequest();
        $statusCode = self::HTTP_STATUS_MAP[get_class($exception)] ?? 500;
        http_response_code($statusCode);
        
        $type = self::EXCEPTION_MAP[get_class($exception)] ?? basename(str_replace('\\', '/', get_class($exception)));
        $context = [
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString()
        ];
        error_log("[{$type}] {$exception->getMessage()} " . json_encode($context));

        if ($isApiRequest) {
            // Preparar el JSON response
            $jsonResponse = [
                'error' => true,
                'message' => $exception->getMessage(),
                'type' => $type,
                'status' => $statusCode,
                'file' => $exception->getFile(),
                'line' => $exception->getLine()
            ];
            
            // Mostrar la plantilla HTML con el JSON inyectado
            $css = file_get_contents(__DIR__ . '/exeptions.css');
            $iconContent = file_get_contents(__DIR__ . '/icon.png');
            $iconData = $iconContent !== false ? base64_encode($iconContent) : '';
            
            $vars = [
                '{{style}}'   => $css !== false ? '<style>' . $css . '</style>' : '',
                '{{icon}}'    => $iconData ? '<img src="data:image/png;base64,' . $iconData . '" alt="">' : '',
                '{{favicon}}' => $iconData ? 'data:image/png;base64,' . $iconData : '',
                '{{message}}' => htmlspecialchars($exception->getMessage(), ENT_QUOTES, 'UTF-8'),
                '{{trace}}'   => '<strong>API Response:</strong><br><pre>' . 
                                htmlspecialchars(json_encode($jsonResponse, JSON_PRETTY_PRINT), ENT_QUOTES, 'UTF-8') . 
                                '</pre><br><br><strong>Stack Trace:</strong><br>' .
                                nl2br(htmlspecialchars($exception->getTraceAsString(), ENT_QUOTES, 'UTF-8')),
            ];
            
            $html = file_get_contents(__DIR__ . '/exeptions.html');
            echo str_replace(array_keys($vars), array_values($vars), $html);
            return;
        }

        // Si no es API, mostrar HTML normal
        $css = file_get_contents(__DIR__ . '/exeptions.css');
        $iconContent = file_get_contents(__DIR__ . '/icon.png');
        $iconData = $iconContent !== false ? base64_encode($iconContent) : '';
        
        $vars = [
            '{{style}}'   => $css !== false ? '<style>' . $css . '</style>' : '',
            '{{icon}}'    => $iconData ? '<img src="data:image/png;base64,' . $iconData . '" alt="">' : '',
            '{{favicon}}' => $iconData ? 'data:image/png;base64,' . $iconData : '',
            '{{message}}' => htmlspecialchars($exception->getMessage(), ENT_QUOTES, 'UTF-8'),
            '{{trace}}'   => nl2br(htmlspecialchars($exception->getTraceAsString(), ENT_QUOTES, 'UTF-8')),
        ];
        
        $html = file_get_contents(__DIR__ . '/exeptions.html');
        echo str_replace(array_keys($vars), array_values($vars), $html);
    }

    public static function handleShutdown(): void
    {
        $error = error_get_last();
        if ($error === null || !in_array($error['type'], self::CRITICAL_ERROR_TYPES, true)) {
            return;
        }
        
        http_response_code(500);
        error_log("[FatalError] {$error['message']} en {$error['file']}:{$error['line']}");
        
        $fatalException = new RuntimeException(
            "Error fatal: {$error['message']} en {$error['file']}:{$error['line']}"
        );
        
        self::handleException($fatalException);
    }

    private static function isApiRequest(): bool
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        return str_contains($uri, '/api/');
    }

    private static function isDevelopment(): bool
    {
        return ($_SERVER['SERVER_NAME'] ?? '') === 'localhost';
    }
}