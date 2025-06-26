<?php
namespace App\Models;
use App\Core\Connection;
use Exception;

class Supplies{
    private $db;
    
    public function supplies(){    
        return "Este es un modelo de Supplies";
    }
    
    public function create(){
        header('Content-Type: application/json');
        
        $this->db = Connection::getInstance();
        
        $nombre = $_POST['nombre'] ?? '';
        $nueva_unidad = $_POST['nueva_unidad'] ?? '';
        $costo_unitario = $_POST['costo_unitario'] ?? 0;
        $stock = $_POST['stock'] ?? 0;
        
        try {
            $sql = "INSERT INTO insumos (nombre, unidad, costo_unitario, stock) VALUES (?, ?, ?, ?)";
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([$nombre, $nueva_unidad, $costo_unitario, $stock]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Insumo agregado correctamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al agregar insumo']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    public function getAll(){
        header('Content-Type: application/json');        
        $this->db = Connection::getInstance();        
        try {
            $sql = "SELECT * FROM insumos";
            $stmt = $this->db->query($sql);
            $supplies = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            echo json_encode($supplies);
        } catch (Exception $e) {
            echo json_encode(['error' => 'Error al obtener los insumos: ' . $e->getMessage()]);
        }
    }    
    
    
}
?>