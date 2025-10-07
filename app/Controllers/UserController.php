<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Controllers\Base\BaseController;
use App\Models\User;
use App\Router\Request;
use App\Router\Response;
use App\ExceptionsPheonix\DatabaseException;

class UserController extends BaseController
{
    private const REQUIRED_FIELDS = ['first_name', 'last_name', 'email', 'code_id', 'position', 'salary_hr', 'hire_date'];
    
    private User $userModel;

    public function __construct()
    {
        parent::__construct();
        $this->userModel = new User();
    }

    private function validateEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    private function validateRequiredFields(array $data): ?string
    {
        foreach (self::REQUIRED_FIELDS as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return "El campo {$field} es requerido";
            }
        }
        return null;
    }

    public function index(Request $request, Response $response): void
    {
        try {
            $users = $this->userModel->getAll();
            $this->successResponse($users, 'Usuarios obtenidos exitosamente');
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

            if (!$this->validateEmail($data['email'])) {
                $this->errorResponse('Email no valido', 400);
                return;
            }

            $id = $this->userModel->create($data);
            
            if (!$id) {
                $this->errorResponse('Error al crear usuario', 500);
                return;
            }

            $this->successResponse(['id' => $id], 'Usuario creado exitosamente');
        } catch (DatabaseException $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
}
