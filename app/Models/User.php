<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Connection;
use App\ExceptionsPheonix\DatabaseException;
use PDO;
use PDOException;

class User
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Connection::getInstance();
    }

    public function getAll(): array
    {
        try {
            $sql = "SELECT id, email, role, profile, created_at, updated_at FROM tenant_001.users ORDER BY created_at DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new DatabaseException("Error al obtener usuarios: " . $e->getMessage());
        }
    }

    public function create(array $data): string
    {
        try {
            $profile = [
                'first_name' => $data['first_name'] ?? '',
                'last_name' => $data['last_name'] ?? '',
                'second_last_name' => $data['second_last_name'] ?? '',
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'age' => $data['age'] ?? null,
                'salary_hr' => $data['salary_hr'] ?? null,
                'payment_currency' => $data['payment_currency'] ?? 0,
                'payment_type' => $data['payment_type'] ?? 0,
                'payment_method' => $data['payment_method'] ?? 0,
                'pay_day' => $data['pay_day'] ?? 0,
                'position' => $data['position'] ?? '',
                'branch' => $data['branch'] ?? 0,
                'hire_date' => $data['hire_date'] ?? null,
                'work_schedule' => $data['work_schedule'] ?? 48,
                'hours_per_week' => $data['hours_per_week'] ?? null,
                'country_code' => $data['country_code'] ?? '',
                'phone' => $data['phone'] ?? '',
                'address' => $data['address'] ?? '',
                'code_id' => $data['code_id'] ?? '',
                'fingerprint_id' => $data['fingerprint_id'] ?? null,
                'status' => $data['status'] ?? true
            ];

            $sql = "INSERT INTO tenant_001.users (email, password_hash, role, profile) 
                    VALUES (:email, :password_hash, :role, :profile) 
                    RETURNING id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':email' => $data['email'],
                ':password_hash' => password_hash($data['code_id'], PASSWORD_DEFAULT),
                ':role' => $data['role'] ?? 'employee',
                ':profile' => json_encode($profile)
            ]);
            
            return $stmt->fetchColumn();
        } catch (PDOException $e) {
            throw new DatabaseException("Error al crear usuario: " . $e->getMessage());
        }
    }
}
