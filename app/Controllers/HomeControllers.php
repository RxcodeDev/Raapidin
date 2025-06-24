<?php
namespace App\Controllers;
use App\Core\Connection;

class HomeControllers {
    public function index() {
        $db = Connection::getInstance();
        return "Este es un controlador base";

    }

    public function saludar() {
        return "Hola desde /saludo";
    }
}
?>