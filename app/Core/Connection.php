<?php
namespace App\Core;

use App\ExceptionsPheonix\ConnectionException;
use PDO;
use PDOException;

class Connection {
    private static $instance = null;

    public static function getInstance() {
        if (self::$instance === null) {
            $config = require __DIR__ . '/../../config/database.php';
            $dsn = "pgsql:host={$config['host']};port={$config['port']};dbname={$config['dbname']}";
            try {
                self::$instance = new PDO($dsn, $config['user'], $config['pwd'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
                error_log("Conectado");
            } catch (PDOException $e) {
                throw new ConnectionException("Error de conexión: " . $e->getMessage());
            }
        }
        return self::$instance;
    }
}