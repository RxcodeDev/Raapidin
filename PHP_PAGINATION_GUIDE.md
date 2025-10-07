# Backend PHP - Soporte de Paginación

## Cambios Implementados

### 1. BaseController (`app/Controllers/Base/BaseController.php`)

```php
// Respuesta paginada estándar
protected function paginatedResponse(array $data, array $meta, string $message = 'Success'): void
{
    $response = [
        'success' => true,
        'message' => $message,
        'data' => $data,
        'meta' => $meta
    ];
    $this->response->json($response);
}

// Obtener parámetros de paginación desde query params
protected function getPaginationParams(): array
{
    $page = max(1, (int) ($this->request->query('page') ?? 1));
    $limit = min(100, max(1, (int) ($this->request->query('limit') ?? 20)));
    $offset = ($page - 1) * $limit;
    
    return compact('page', 'limit', 'offset');
}
```

### 2. Request (`app/Router/Request.php`)

```php
// Obtener parámetro query específico
public function query(string $key, mixed $default = null): mixed
{
    return $this->query[$key] ?? $default;
}
```

### 3. Tenant Model (`app/Models/Tenant.php`)

```php
// Obtener tenants con paginación y filtros
public function getPaginated(int $limit = 20, int $offset = 0, array $filters = []): array
{
    // Soporte para filtros: search, status
    // Búsqueda en: business_name, owner_email, display_slug
    // ORDER BY created_at DESC
    // LIMIT y OFFSET
}

// Contar total con mismos filtros
public function getTotal(array $filters = []): int
{
    // COUNT(*) con mismos WHERE que getPaginated
}
```

### 4. TenantController (`app/Controllers/TenantController.php`)

```php
public function index(Request $request, Response $response): void
{
    // Obtener parámetros de paginación
    $pagination = $this->getPaginationParams();
    
    // Obtener filtros desde query params
    $filters = [
        'search' => $request->query('search'),
        'status' => $request->query('status')
    ];
    
    // Si no hay parámetros de paginación, retorna todo (compatibilidad)
    if (empty($pagination['page']) && empty($pagination['limit'])) {
        $tenants = $this->tenantModel->getAll();
        $this->successResponse($tenants);
        return;
    }
    
    // Obtener datos paginados
    $tenants = $this->tenantModel->getPaginated(
        $pagination['limit'], 
        $pagination['offset'], 
        $filters
    );
    
    // Calcular metadata
    $total = $this->tenantModel->getTotal($filters);
    $totalPages = ceil($total / $pagination['limit']);
    
    $meta = [
        'currentPage' => $pagination['page'],
        'pageSize' => $pagination['limit'],
        'totalItems' => $total,
        'totalPages' => $totalPages,
        'hasNext' => $pagination['page'] < $totalPages,
        'hasPrev' => $pagination['page'] > 1,
        'from' => $pagination['offset'] + 1,
        'to' => min($pagination['offset'] + $pagination['limit'], $total)
    ];
    
    // Respuesta paginada
    $this->paginatedResponse($tenants, $meta);
}
```

## Endpoints Actualizados

### GET /api/tenants

**Sin paginación (compatibilidad):**
```
GET /api/tenants
```

**Con paginación:**
```
GET /api/tenants?page=1&limit=20
GET /api/tenants?page=2&limit=50
```

**Con filtros:**
```
GET /api/tenants?search=restaurant&status=active
GET /api/tenants?page=1&limit=20&search=hotel
```

## Respuesta Paginada

```json
{
    "success": true,
    "message": "Tenants obtenidos exitosamente",
    "data": [
        {
            "id": "uuid",
            "business_name": "Restaurant XYZ",
            "status": "active",
            "owner_email": "owner@example.com",
            "created_at": "2025-10-03T10:00:00Z"
        }
    ],
    "meta": {
        "currentPage": 1,
        "pageSize": 20,
        "totalItems": 150,
        "totalPages": 8,
        "hasNext": true,
        "hasPrev": false,
        "from": 1,
        "to": 20
    }
}
```

## Características

✅ **Retrocompatible** - Sin parámetros funciona como antes  
✅ **Límites seguros** - Máximo 100 elementos por página  
✅ **Filtros inteligentes** - Búsqueda por texto y estado  
✅ **Búsqueda ILIKE** - Case insensitive en PostgreSQL  
✅ **Metadata completa** - Toda la info para el frontend  
✅ **SQL optimizado** - LIMIT/OFFSET eficiente