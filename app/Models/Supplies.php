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
        $unidad = $_POST['unidad'] ?? '';
        $costo_unitario = $_POST['costo_unitario'] ?? 0;
        $stock = $_POST['stock'] ?? 0;
        
        try {
            $sql = "INSERT INTO insumos (nombre, unidad, costo_unitario, stock) VALUES (?, ?, ?, ?)";
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([$nombre, $unidad, $costo_unitario, $stock]);
            
            if ($result) {
                $newId = $this->db->lastInsertId();
                echo json_encode([
                    'success' => true, 
                    'message' => 'Insumo agregado correctamente',
                    'id' => (int)$newId,
                    'data' => [
                        'id' => (int)$newId,
                        'nombre' => $nombre,
                        'unidad' => $unidad,
                        'costo_unitario' => $costo_unitario,
                        'stock' => $stock
                    ]
                ]);
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
            $sql = "SELECT id, nombre, unidad, costo_unitario, stock FROM insumos ORDER BY id";
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
    
    public function delete($id = null){
        header('Content-Type: application/json');
        $this->db = Connection::getInstance();
        
        try {
            // Validar que se reciba un ID
            if (!$id) {
                echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
                return;
            }
            
            // Verificar que el insumo existe antes de eliminarlo
            $checkSql = "SELECT id FROM insumos WHERE id = ?";
            $checkStmt = $this->db->prepare($checkSql);
            $checkStmt->execute([$id]);
            
            if (!$checkStmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Insumo no encontrado']);
                return;
            }
            
            // Eliminar el insumo
            $sql = "DELETE FROM insumos WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([$id]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Insumo eliminado correctamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al eliminar insumo']);
            }
            
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
    
}
?>