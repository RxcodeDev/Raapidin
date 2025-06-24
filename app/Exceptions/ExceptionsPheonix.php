<?php

namespace App\ExceptionsPheonix;
use Throwable;
class AutoloadException extends \Exception {}
class ConnectionException extends \Exception {}

class Exceptions
{
    public static function handleException(Throwable $e): void
    {
        http_response_code(500);        
        if ($e instanceof AutoloadException) {
            error_log("[AutoloadException] {$e->getMessage()}");
        } elseif ($e instanceof ConnectionException) {
            error_log("[ConnectionException] {$e->getMessage()}");
        } else {
            error_log("[Exception] {$e->getMessage()}");
        }
        $css = file_get_contents(__DIR__ . '/exeptions.css');
        $iconPath = __DIR__ . '/icon.png';
        $iconData = base64_encode(file_get_contents($iconPath));
        $vars = [
            '{{style}}'   => '<style>' . $css . '</style>',
            '{{icon}}'    => '<img src="data:image/png;base64,' . $iconData . '" alt="">',
            '{{favicon}}' => 'data:image/png;base64,' . $iconData,
            '{{message}}' => htmlspecialchars($e->getMessage()),
            '{{trace}}'   => nl2br(htmlspecialchars($e->getTraceAsString())),
        ];
        $html = file_get_contents(__DIR__ . '/exeptions.html');
        $html = str_replace(array_keys($vars), array_values($vars), $html);
        echo $html;
    }

    public static function handleShutdown(): void
    {
        $error = error_get_last();
        if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
            http_response_code(500);
            error_log("[FatalError] {$error['message']} en {$error['file']}:{$error['line']}");
            echo "<h1>Error fatal del</h1>";
            echo "<pre>{$error['message']} en {$error['file']}:{$error['line']}</pre>";
        }
    }
}