<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Controllers\Base\BaseController;
use App\Models\Tenant;
use App\Router\Request;
use App\Router\Response;
use App\ExceptionsPheonix\DatabaseException;
use App\Core\Connection;

class TenantController extends BaseController
{
    private const VALID_STATUSES = ['active', 'inactive', 'suspended', 'expired'];
    private const REQUIRED_FIELDS = ['business_name', 'schema_name', 'display_slug', 'owner_email'];
    
    private Tenant $tenantModel;

    public function __construct()
    {
        parent::__construct();
        $this->tenantModel = new Tenant();
    }

    private function isValidUuid(string $uuid): bool
    {
        try {
            $db = Connection::getInstance();
            $stmt = $db->prepare("SELECT ?::uuid");
            $stmt->execute([$uuid]);
            return true;
        } catch (\PDOException $e) {
            return false;
        }
    }

    private function validateUuidParam(string $id): bool
    {
        if (!$id || empty(trim($id))) {
            $this->errorResponse('ID del tenant requerido', 400);
            return false;
        }

        if (!$this->isValidUuid($id)) {
            $this->errorResponse('ID del tenant debe ser un UUID valido', 400);
            return false;
        }

        return true;
    }

    private function validateEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    private function validateRequiredFields(array $data): ?string
    {
        foreach (self::REQUIRED_FIELDS as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return "El campo $field es requerido";
            }
        }
        return null;
    }

    private function validateStatus(string $status): bool
    {
        return in_array($status, self::VALID_STATUSES);
    }

    public function index(Request $request, Response $response): void
    {
        try {
            $tenants = $this->tenantModel->getAll();
            $this->successResponse($tenants, 'Tenants obtenidos exitosamente');
        } catch (DatabaseException $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function getActive(Request $request, Response $response): void
    {
        try {
            $tenants = $this->tenantModel->getActive();
            $this->successResponse($tenants, 'Tenants activos obtenidos exitosamente');
        } catch (DatabaseException $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function show(Request $request, Response $response): void
    {
        try {
            $id = $request->getParam('id');
            
            if (!$this->validateUuidParam($id)) {
                return;
            }

            $tenant = $this->tenantModel->getById($id);
            
            if (!$tenant) {
                $this->errorResponse('Tenant no encontrado', 404);
                return;
            }

            $this->successResponse($tenant, 'Tenant obtenido exitosamente');
        } catch (DatabaseException $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function getBySlug(Request $request, Response $response): void
    {
        try {
            $slug = $request->getParam('slug');
            
            if (!$slug) {
                $this->errorResponse('Slug del tenant requerido', 400);
                return;
            }

            $tenant = $this->tenantModel->getBySlug($slug);
            
            if (!$tenant) {
                $this->errorResponse('Tenant no encontrado', 404);
                return;
            }

            $this->successResponse($tenant, 'Tenant obtenido exitosamente');
        } catch (DatabaseException $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function store(Request $request, Response $response): void
    {
        try {
            $data = $request->getBody();
            
            $validationError = $this->validateRequiredFields($data);
            if ($validationError) {
                $this->errorResponse($validationError, 400);
                return;
            }

            if (!$this->validateEmail($data['owner_email'])) {
                $this->errorResponse('Email invalido', 400);
                return;
            }

            $id = $this->tenantModel->create($data);
            
            if (!$id) {
                $this->errorResponse('Error al crear el tenant', 500);
                return;
            }

            $newTenant = $this->tenantModel->getById($id);
            $this->successResponse($newTenant, 'Tenant creado exitosamente');
        } catch (DatabaseException $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function update(Request $request, Response $response): void
    {
        try {
            $id = $request->getParam('id');
            $data = $request->getBody();
            
            if (!$this->validateUuidParam($id)) {
                return;
            }

            $existingTenant = $this->tenantModel->getById($id);
            if (!$existingTenant) {
                $this->errorResponse('Tenant no encontrado', 404);
                return;
            }

            if (isset($data['owner_email']) && !$this->validateEmail($data['owner_email'])) {
                $this->errorResponse('Email invalido', 400);
                return;
            }

            $updated = $this->tenantModel->update($id, $data);
            
            if (!$updated) {
                $this->errorResponse('Error al actualizar el tenant', 500);
                return;
            }

            $updatedTenant = $this->tenantModel->getById($id);
            $this->successResponse($updatedTenant, 'Tenant actualizado exitosamente');
        } catch (DatabaseException $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function updateStatus(Request $request, Response $response): void
    {
        try {
            $id = $request->getParam('id');
            $data = $request->getBody();
            
            if (!$this->validateUuidParam($id)) {
                return;
            }

            if (!isset($data['status']) || empty($data['status'])) {
                $this->errorResponse('Estado requerido', 400);
                return;
            }

            if (!$this->validateStatus($data['status'])) {
                $this->errorResponse('Estado invalido. Debe ser: ' . implode(', ', self::VALID_STATUSES), 400);
                return;
            }

            $updated = $this->tenantModel->updateStatus($id, $data['status']);
            
            if (!$updated) {
                $this->errorResponse('Error al actualizar el estado del tenant', 500);
                return;
            }

            $updatedTenant = $this->tenantModel->getById($id);
            $this->successResponse($updatedTenant, 'Estado del tenant actualizado exitosamente');
        } catch (DatabaseException $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
}