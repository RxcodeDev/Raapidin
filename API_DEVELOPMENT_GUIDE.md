# API Tenants - Guía de Desarrollo

## 🏗️ Estructura del Proyecto

El proyecto ahora sigue una arquitectura MVC limpia y organizada:

```
app/
├── Controllers/         # Controladores de la aplicación
│   ├── Base/           # Controlador base con funciones comunes
│   └── TenantController.php
├── Models/             # Modelos para interactuar con la base de datos
│   └── Tenant.php
├── Router/             # Sistema de enrutamiento
└── Core/               # Configuraciones centrales (DB, etc.)

routes/
└── api.php            # Definición de todas las rutas API

public/
├── index.php          # Punto de entrada de la aplicación
└── api-test.html      # Página de pruebas para la API
```

## 🔄 Flujo de Trabajo para Nuevas Funcionalidades

### 1. Crear un Modelo
Los modelos manejan toda la lógica de base de datos. Ubicación: `app/Models/`

**Ejemplo: Crear modelo Product**
```php
<?php
namespace App\Models;

use App\Core\Connection;
use PDO;

class Product
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Connection::getInstance();
    }

    public function getAll(): array
    {
        // Tu lógica SQL aquí
    }
    
    // Más métodos...
}
```

### 2. Crear un Controlador
Los controladores manejan las peticiones HTTP y coordinan entre modelos y respuestas.
Ubicación: `app/Controllers/`

**Ejemplo: Crear controlador Product**
```php
<?php
namespace App\Controllers;

use App\Controllers\Base\BaseController;
use App\Models\Product;

class ProductController extends BaseController
{
    private Product $productModel;

    public function __construct()
    {
        parent::__construct();
        $this->productModel = new Product();
    }

    public function index(Request $request, Response $response): void
    {
        try {
            $products = $this->productModel->getAll();
            $this->successResponse($products);
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
}
```

### 3. Definir las Rutas
Agregar las nuevas rutas en `routes/api.php`

```php
<?php
use App\Controllers\ProductController;

return [
    // Rutas existentes de Tenants...
    
    // Nuevas rutas de Products
    'GET /api/products' => [ProductController::class, 'index'],
    'GET /api/products/{id}' => [ProductController::class, 'show'],
    'POST /api/products' => [ProductController::class, 'store'],
    // etc...
];
```

## 📝 API Endpoints Disponibles (Tenants)

### GET `/api/tenants`
- **Descripción**: Obtiene todos los tenants
- **Respuesta**: Lista de tenants con toda la información

### GET `/api/tenants/active`
- **Descripción**: Obtiene solo los tenants activos
- **Respuesta**: Lista de tenants con status 'active'

### GET `/api/tenants/{id}`
- **Descripción**: Obtiene un tenant específico por ID
- **Parámetros**: `id` (integer)
- **Respuesta**: Datos del tenant o error 404

### GET `/api/tenants/slug/{slug}`
- **Descripción**: Obtiene un tenant por su slug
- **Parámetros**: `slug` (string)
- **Respuesta**: Datos del tenant o error 404

### POST `/api/tenants`
- **Descripción**: Crea un nuevo tenant
- **Body requerido**:
```json
{
    "business_name": "string (requerido)",
    "schema_name": "string (requerido)",
    "display_slug": "string (requerido)",
    "owner_email": "string (requerido, email válido)",
    "subscription_plan": "string (opcional, default: 'free')",
    "business_type": "string (opcional, default: 'restaurant')",
    "timezone": "string (opcional, default: 'UTC')",
    "currency": "string (opcional, default: 'USD')",
    "settings": "object (opcional)"
}
```

### PUT `/api/tenants/{id}`
- **Descripción**: Actualiza un tenant completo
- **Parámetros**: `id` (integer)
- **Body**: Datos del tenant a actualizar

### PATCH `/api/tenants/{id}/status`
- **Descripción**: Actualiza solo el estado del tenant
- **Parámetros**: `id` (integer)
- **Body**:
```json
{
    "status": "active|inactive|suspended|expired"
}
```

## 🧪 Cómo Probar la API

1. **Usar el archivo de pruebas**: Abre `http://tu-dominio/api-test.html`
2. **Con curl**:
```bash
# Obtener todos los tenants
curl -X GET http://tu-dominio/api/tenants

# Crear un tenant
curl -X POST http://tu-dominio/api/tenants \
  -H "Content-Type: application/json" \
  -d '{"business_name":"Test","schema_name":"test_schema","display_slug":"test","owner_email":"test@test.com"}'
```

3. **Con Postman**: Importa las rutas usando la documentación anterior

## 🔧 Métodos Útiles del BaseController

El `BaseController` proporciona métodos útiles para todas las respuestas:

- `successResponse($data, $message)`: Respuesta exitosa estándar
- `errorResponse($message, $statusCode)`: Respuesta de error estándar
- `jsonResponse($data, $statusCode)`: Respuesta JSON personalizada

## 📊 Estructura de Respuestas API

### Respuesta Exitosa
```json
{
    "success": true,
    "message": "Descripción del éxito",
    "data": { /* datos solicitados */ }
}
```

### Respuesta de Error
```json
{
    "error": "Descripción del error"
}
```

## 🚀 Próximos Pasos

1. **Crear más modelos y controladores** siguiendo el mismo patrón
2. **Implementar middleware** para autenticación y validación
3. **Agregar más validaciones** en los controladores
4. **Implementar paginación** en listados grandes
5. **Agregar logging** para debugging

## 💡 Buenas Prácticas

1. **Siempre extender BaseController** para controladores nuevos
2. **Validar datos de entrada** en los controladores
3. **Manejar excepciones** apropiadamente
4. **Usar transacciones** para operaciones que afecten múltiples tablas
5. **Mantener los modelos enfocados** en operaciones de base de datos
6. **Los controladores deben ser delgados**, la lógica compleja va en servicios

¡Ya tienes una base sólida para desarrollar tu API! 🎉