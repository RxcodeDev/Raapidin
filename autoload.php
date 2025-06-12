<?php
require_once __DIR__ . '/app/Exceptions/ExceptionsPheonix.php';

use App\ExceptionsPheonix\AutoloadException;
use App\ExceptionsPheonix\Exceptions;
set_exception_handler([Exceptions::class, 'handleException']);
register_shutdown_function([Exceptions::class, 'handleShutdown']);

$namespaceMap = [
    'App\\' => __DIR__ . '/app/',
];

spl_autoload_register(function (string $class) use ($namespaceMap): void {
    foreach ($namespaceMap as $prefix => $baseDir) {
        if (str_starts_with($class, $prefix)) {
            $relativeClass = substr($class, strlen($prefix));
            $file = $baseDir . str_replace('\\', DIRECTORY_SEPARATOR, $relativeClass) . '.php';
            if (is_file($file)) {
                require_once $file;
                return;
            } else {                
                throw new AutoloadException(
                    "Autoload error: Archivo no encontrado para la clase {$class} en {$file}"
                );
            }
        }
    }
});