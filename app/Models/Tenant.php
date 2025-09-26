<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Connection;
use App\ExceptionsPheonix\DatabaseException;
use PDO;
use PDOException;

class Tenant
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Connection::getInstance();
    }

    /**
     * Obtener todos los tenants
     */
    public function getAll(): array
    {
        try {
            $sql = "SELECT 
                        id, 
                        business_name, 
                        schema_name, 
                        display_slug, 
                        owner_email, 
                        subscription_plan, 
                        status, 
                        created_at, 
                        trial_ends_at, 
                        business_type, 
                        timezone, 
                        currency, 
                        settings
                    FROM core.tenants
                    ORDER BY created_at DESC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new DatabaseException("Error al obtener tenants: " . $e->getMessage());
        }
    }

    /**
     * Obtener tenant por ID
     */
    public function getById(string $id): ?array
    {
        try {
            $sql = "SELECT 
                        id, 
                        business_name, 
                        schema_name, 
                        display_slug, 
                        owner_email, 
                        subscription_plan, 
                        status, 
                        created_at, 
                        trial_ends_at, 
                        business_type, 
                        timezone, 
                        currency, 
                        settings
                    FROM core.tenants 
                    WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_STR);
            $stmt->execute();
            
            $result = $stmt->fetch();
            return $result ?: null;
        } catch (PDOException $e) {
            throw new DatabaseException("Error al obtener tenant por ID: " . $e->getMessage());
        }
    }

    /**
     * Obtener tenant por slug
     */
    public function getBySlug(string $slug): ?array
    {
        try {
            $sql = "SELECT 
                        id, 
                        business_name, 
                        schema_name, 
                        display_slug, 
                        owner_email, 
                        subscription_plan, 
                        status, 
                        created_at, 
                        trial_ends_at, 
                        business_type, 
                        timezone, 
                        currency, 
                        settings
                    FROM core.tenants 
                    WHERE display_slug = :slug";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':slug', $slug, PDO::PARAM_STR);
            $stmt->execute();
            
            $result = $stmt->fetch();
            return $result ?: null;
        } catch (PDOException $e) {
            throw new DatabaseException("Error al obtener tenant por slug: " . $e->getMessage());
        }
    }

    /**
     * Obtener tenants activos
     */
    public function getActive(): array
    {
        try {
            $sql = "SELECT 
                        id, 
                        business_name, 
                        schema_name, 
                        display_slug, 
                        owner_email, 
                        subscription_plan, 
                        status, 
                        created_at, 
                        trial_ends_at, 
                        business_type, 
                        timezone, 
                        currency, 
                        settings
                    FROM core.tenants 
                    WHERE status = 'active'
                    ORDER BY created_at DESC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new DatabaseException("Error al obtener tenants activos: " . $e->getMessage());
        }
    }

    /**
     * Crear nuevo tenant
     */
    public function create(array $data): string
    {
        try {
            $sql = "INSERT INTO core.tenants 
                    (business_name, schema_name, display_slug, owner_email, 
                     subscription_plan, business_type, timezone, currency, settings)
                    VALUES 
                    (:business_name, :schema_name, :display_slug, :owner_email,
                     :subscription_plan, :business_type, :timezone, :currency, :settings)
                    RETURNING id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':business_name' => $data['business_name'],
                ':schema_name' => $data['schema_name'],
                ':display_slug' => $data['display_slug'],
                ':owner_email' => $data['owner_email'],
                ':subscription_plan' => $data['subscription_plan'] ?? 'free',
                ':business_type' => $data['business_type'] ?? 'restaurant',
                ':timezone' => $data['timezone'] ?? 'UTC',
                ':currency' => $data['currency'] ?? 'USD',
                ':settings' => json_encode($data['settings'] ?? [])
            ]);
            
            return $stmt->fetchColumn();
        } catch (PDOException $e) {
            throw new DatabaseException("Error al crear tenant: " . $e->getMessage());
        }
    }

    /**
     * Actualizar tenant
     */
    public function update(string $id, array $data): bool
    {
        try {
            $sql = "UPDATE core.tenants 
                    SET business_name = :business_name,
                        owner_email = :owner_email,
                        subscription_plan = :subscription_plan,
                        business_type = :business_type,
                        timezone = :timezone,
                        currency = :currency,
                        settings = :settings
                    WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([
                ':id' => $id,
                ':business_name' => $data['business_name'],
                ':owner_email' => $data['owner_email'],
                ':subscription_plan' => $data['subscription_plan'],
                ':business_type' => $data['business_type'],
                ':timezone' => $data['timezone'],
                ':currency' => $data['currency'],
                ':settings' => json_encode($data['settings'] ?? [])
            ]);
        } catch (PDOException $e) {
            throw new DatabaseException("Error al actualizar tenant: " . $e->getMessage());
        }
    }

    /**
     * Actualizar estado del tenant
     */
    public function updateStatus(string $id, string $status): bool
    {
        try {
            $sql = "UPDATE core.tenants SET status = :status WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            
            return $stmt->execute([
                ':id' => $id,
                ':status' => $status
            ]);
        } catch (PDOException $e) {
            throw new DatabaseException("Error al actualizar estado del tenant: " . $e->getMessage());
        }
    }
}