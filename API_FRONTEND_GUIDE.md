# API Frontend Architecture

## Estructura del Sistema

### 1. ApiService (`services/ApiService.js`)
Clase base para manejo de peticiones HTTP:
- Configuración de headers globales
- Métodos HTTP estándar (GET, POST, PUT, PATCH, DELETE)
- Manejo unificado de errores con ApiError
- Instancia global `api`

### 2. Servicios Específicos (`services/`)
Clases estáticas que encapsulan endpoints por recurso:
- `TenantService.js` - Operaciones de tenants
- Métodos estáticos para cada endpoint
- Uso de ApiService interno

### 3. RequestHandler (`services/RequestHandler.js`)
Manejo centralizado de peticiones:
- Control de loading states
- Patrón execute y handleWithCallback
- Gestión unificada de errores
- Retorna `{ success, data, error, status }`

### 4. Controllers (`controllers/`)
Lógica de negocio del frontend:
- Estado local de datos
- Operaciones CRUD con cache
- Filtros y búsquedas
- Invalidación inteligente de cache

### 5. Utils (`utils/`)
- `CacheManager.js` - Cache con TTL e invalidación por patrones
- `managers.js` - LoadingManager para estados de carga

### 6. Pages (`pages/`)
Módulos de página con:
- Inicialización de eventos
- Renderizado de datos
- Manejo de formularios
- Cleanup automático

## Uso Básico

```javascript
// En cualquier página
import { appApi } from '../api.js';

// Cargar datos
const result = await appApi.tenants.loadTenants();
if (result.success) {
    console.log(result.data);
} else {
    console.error(result.error);
}

// Crear tenant
const newTenant = await appApi.tenants.createTenant(data);

// Con callback
await RequestHandler.handleWithCallback(
    () => TenantService.getAll(),
    (data) => console.log('Success:', data),
    (error) => console.error('Error:', error)
);
```

## Características

- **Cache inteligente** con TTL e invalidación por patrones
- **Loading states** automáticos
- **Error handling** unificado
- **Modular** y escalable
- **Zero dependencies** externas
- **Respuestas consistentes** con patrón success/error

## Convenciones

- Servicios: métodos estáticos
- Controllers: instancias con estado
- Pages: módulos con init/cleanup
- Errores: ApiError con status y data
- Cache: keys descriptivas con prefijos
- Respuestas: `{ success: boolean, data?, error?, status? }`