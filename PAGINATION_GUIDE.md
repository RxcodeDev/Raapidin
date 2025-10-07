# Sistema de Paginación y Rendimiento

## Componentes del Sistema

### 1. PaginationManager (`utils/PaginationManager.js`)
Manejo inteligente de paginación con cache:

```javascript
const pagination = new PaginationManager({ 
    pageSize: 20,
    prefetchThreshold: 2,
    maxCacheSize: 50 
});

// Cache por página y filtros
pagination.cachePage(1, data, { search: 'query' });
const cached = pagination.getCachedPage(1, { search: 'query' });

// Prefetch automático de páginas cercanas
pagination.shouldPrefetch(currentPage);
```

### 2. LazyLoader (`utils/LazyLoader.js`)
Carga diferida con Intersection Observer:

```javascript
import { lazyLoader } from '../utils/LazyLoader.js';

// Observar elemento para lazy loading
lazyLoader.observe(element, async (target) => {
    await loadContent(target);
});

// Procesamiento en lotes para mejor rendimiento
const loader = new LazyLoader({ 
    batchSize: 5,
    threshold: 200,
    debounceTime: 150 
});
```

### 3. TenantController Mejorado
Integra paginación, cache y prefetch:

```javascript
// Carga con cache inteligente
await controller.loadPage(1, filters);

// Búsqueda con debounce
await controller.searchTenants(query, page);

// Prefetch automático de páginas cercanas
controller.prefetchNearbyPages(currentPage, filters);

// Infinite scroll
controller.setupLazyLoading(container, loadMoreCallback);
```

## Estrategias de Rendimiento

### **Cache Multi-Nivel**
```javascript
// 1. Cache por página + filtros
const key = `page_${page}_size_${size}_${JSON.stringify(filters)}`;

// 2. Cache con TTL automático  
cache.set(key, data, 300000); // 5 minutos

// 3. Invalidación inteligente por patrones
cache.invalidatePattern('search'); // Limpia búsquedas
cache.invalidatePattern('tenants_'); // Limpia tenants
```

### **Prefetch Predictivo**
```javascript
// Prefetch páginas adyacentes automáticamente
if (currentPage + 1 <= totalPages) {
    // Cargar página siguiente en background
    prefetchPage(currentPage + 1);
}
```

### **Lazy Loading Optimizado**
```javascript
// Intersection Observer con threshold
const observer = new IntersectionObserver(callback, {
    rootMargin: '200px', // Cargar 200px antes
    threshold: 0.1
});

// Procesamiento en lotes
const batch = elements.slice(0, 5); // Máximo 5 por vez
```

### **Debounce en Búsquedas**
```javascript
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(e.target.value);
    }, 300); // 300ms de debounce
});
```

## Patrones de Uso

### **Paginación Tradicional**
```javascript
// Cargar página específica
const result = await appApi.tenants.loadPage(3);
if (result.success) {
    renderTenants(result.data);
    renderPagination(result.meta);
}
```

### **Infinite Scroll**
```javascript
// Setup automático
tenantPage.setupInfiniteScroll();

// Se activa automáticamente al llegar al final
// Carga siguiente página y append a la lista actual
```

### **Búsqueda con Cache**
```javascript
// Primera búsqueda: va al servidor
await searchTenants('restaurant', 1);

// Misma búsqueda: desde cache
await searchTenants('restaurant', 1); // ⚡ Instantáneo

// Nueva búsqueda: limpia cache y va al servidor  
await searchTenants('hotel', 1);
```

## Beneficios

✅ **Cache Inteligente** - Evita peticiones duplicadas  
✅ **Prefetch Automático** - Páginas siguientes ya cargadas  
✅ **Lazy Loading** - Carga solo lo visible  
✅ **Debounce** - Reduce peticiones en búsquedas  
✅ **Infinite Scroll** - UX fluida sin clicks  
✅ **Memory Management** - Cache con límites y TTL  
✅ **Performance** - Procesamiento en lotes  

## Configuración

```javascript
// Personalizar comportamiento
const controller = new TenantController();
controller.pagination = new PaginationManager({
    pageSize: 50,        // Elementos por página
    prefetchThreshold: 3, // Páginas a prefetch
    maxCacheSize: 100    // Máximo páginas en cache
});
```

El sistema maneja automáticamente la optimización sin configuración adicional.