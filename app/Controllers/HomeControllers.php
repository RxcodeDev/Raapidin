<?php
namespace App\Controllers;

class HomeControllers {
    public function index() {
        return "Bienvenido a la página principal.";
    }

    public function saludar() {
        return "Hola desde /saludo";
    }
}
?>