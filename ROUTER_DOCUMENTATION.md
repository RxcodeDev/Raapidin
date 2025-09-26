# Sistema de Rutas Mejorado - Raapidin API

## Descripción General

El sistema de rutas ha sido mejorado para ser más **PSR-compatible**, **mantenible** y **escalable**. Los cambios principales incluyen:

- Separación clara de responsabilidades
- Controladores base con métodos helpers
- Sistema de Request/Response estructurado
- Interfaces para extensibilidad futura

## Estructura del Sistema

### Componentes Principales

```
app/
├── Router/
│   ├── Contracts/           # Interfaces del sistema
│   │   ├── RouterInterface.php
│   │   ├── MiddlewareInterface.php
│   │   └── ResponseInterface.php
│   ├── Router.php           # Router principal
│   ├── Request.php          # Manejo de peticiones
│   ├── Response.php         # Manejo de respuestas
│   └── RouteGroup.php       # Agrupación de rutas
├── Controllers/
│   ├── Base/
│   │   └── BaseController.php  # Controlador base
│   ├── HomeController.php
│   └── SuppliesController.php
└── Models/
    └── Supplies.php         # Tu modelo existente
```

## Uso Básico

### 1. Definir Rutas (routes/api.php)

```php
<?php
return [
    'GET /' => ['App\Controllers\HomeController', 'index'],
    'POST /supplies' => ['App\Controllers\SuppliesController', 'store'],
    'PUT /supplies/{id}' => ['App\Controllers\SuppliesController', 'update'],
    'DELETE /supplies/{id}' => ['App\Controllers\SuppliesController', 'destroy'],
];
```

### 2. Crear Controladores

Los controladores extienden `BaseController` y reciben objetos `Request` y `Response`:

```php
<?php
namespace App\Controllers;

use App\Controllers\Base\BaseController;
use App\Router\Request;
use App\Router\Response;

final class MiController extends BaseController
{
    public function index(Request $request, Response $response): void
    {
        // Obtener parámetros
        $nombre = $request->get('nombre', 'default');
        $id = $request->param('id');
        
        // Respuesta exitosa
        $this->successResponse(['data' => $data], 'Operación exitosa');
    }
    
    public function store(Request $request, Response $response): void
    {
        // Obtener datos POST/JSON
        $nombre = $request->post('nombre');
        
        // Respuesta de error
        if (!$nombre) {
            $this->errorResponse('Nombre requerido', 400);
            return;
        }
        
        // Lógica del negocio...
        $this->successResponse(['id' => $nuevoId]);
    }
}
```

## Métodos Disponibles

### BaseController

Los controladores que hereden de `BaseController` tienen acceso a:

- `$this->successResponse($data, $message)` - Respuesta exitosa
- `$this->errorResponse($message, $statusCode)` - Respuesta de error  
- `$this->jsonResponse($array, $statusCode)` - Respuesta JSON directa

### Request

- `$request->get($key, $default)` - Parámetros GET
- `$request->post($key, $default)` - Parámetros POST/JSON
- `$request->param($key, $default)` - Parámetros de ruta (ej: {id})
- `$request->all()` - Todos los parámetros
- `$request->getMethod()` - Método HTTP
- `$request->getUri()` - URI de la petición

### Response

- `$response->json($data, $statusCode)` - Respuesta JSON
- `$response->text($content, $statusCode)` - Respuesta texto
- `$response->status($code)` - Establecer código de estado

## Rutas con Parámetros

### Definición
```php
'GET /users/{id}' => ['App\Controllers\UserController', 'show'],
'PUT /users/{id}/posts/{postId}' => ['App\Controllers\PostController', 'update'],
```

### Uso en el Controlador
```php
public function show(Request $request, Response $response): void
{
    $userId = $request->param('id');
    $postId = $request->param('postId');
    
    // Lógica...
}
```

## Respuestas Estándar

### Respuesta Exitosa
```json
{
    "success": true,
    "message": "Operación exitosa",
    "data": {...}
}
```

### Respuesta de Error
```json
{
    "error": "Mensaje de error"
}
```

## Mejoras Implementadas

1. **PSR Compatibility**: Interfaces y estructura estándar
2. **Separación de Responsabilidades**: Controladores, modelos y rutas separados
3. **Type Safety**: Declaraciones strict_types en todos los archivos
4. **Error Handling**: Manejo centralizado de errores
5. **Request/Response Objects**: Objetos estructurados para manejo de HTTP
6. **Extensibilidad**: Sistema de middleware preparado (futuro)

## Migración Gradual

Para migrar tus controladores existentes:

1. Extiende `BaseController`
2. Cambia la firma del método para recibir `Request $request, Response $response`
3. Usa los métodos helper para respuestas
4. Actualiza las rutas para apuntar al controlador correcto

## Próximos Pasos Sugeridos

- [ ] Implementar middleware de autenticación
- [ ] Validación de datos de entrada
- [ ] Cache de rutas
- [ ] Logging de requests
- [ ] Rate limiting

Este sistema mantiene tu funcionalidad actual mientras proporciona una base sólida para el crecimiento futuro del proyecto.