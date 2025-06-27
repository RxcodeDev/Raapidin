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
        $nueva_unidad = $_POST['unidad'] ?? '';
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
    public function getFieldValues($field = null){
        header('Content-Type: application/json');
        $this->db = Connection::getInstance();
        
        try {
            // Validar que el campo sea permitido (seguridad)
            $allowedFields = ['nombre', 'unidad', 'costo_unitario', 'stock'];
            if (!$field || !in_array($field, $allowedFields)) {
                echo json_encode(['error' => 'Campo no válido']);
                return;
            }
            
            // Obtener parámetro para decidir si usar DISTINCT o no
            $unique = $_GET['unique'] ?? 'false'; // Por defecto false (todos los datos)
            
            if ($unique === 'true' || $unique === '1') {
                // Traer solo valores ÚNICOS
                $sql = "SELECT DISTINCT $field FROM insumos WHERE $field IS NOT NULL AND $field != '' ORDER BY $field";
            } else {
                // Traer TODOS los datos del campo (comportamiento principal)
                $sql = "SELECT $field FROM insumos WHERE $field IS NOT NULL AND $field != '' ORDER BY $field";
            }
            
            $stmt = $this->db->query($sql);
            $values = $stmt->fetchAll(\PDO::FETCH_COLUMN);
            
            echo json_encode($values);
            
        } catch (Exception $e) {
            echo json_encode(['error' => 'Error al obtener valores: ' . $e->getMessage()]);
        }
    }
    
}
?>