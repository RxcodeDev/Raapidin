# Table - Generador Completamente Automático

```javascript
import { Table } from "./TableGenerator.js";

// Con acciones visibles (por defecto)
const table = new Table('tbody-id', [
    { type: 'number', title: '#' },
    { field: 'nombre', title: 'Nombre' },
    { field: 'precio', type: 'money', title: 'Precio' }
], [
    { icon: 'edit', click: 'editItem', params: ['id'] },
    { icon: 'delete', click: 'deleteItem', params: ['id', 'nombre'] }
], true); // true = mostrar acciones

// Sin columna de acciones (aunque tengas acciones definidas)
const tableReadOnly = new Table('tbody-id', [
    { type: 'number', title: '#' },
    { field: 'nombre', title: 'Nombre' },
    { field: 'precio', type: 'money', title: 'Precio' }
], [
    { icon: 'edit', click: 'editItem', params: ['id'] }
], false); // false = ocultar acciones

// Solo datos (sin acciones)
const simpleTable = new Table('tbody-id', [
    { type: 'number', title: '#' },
    { field: 'nombre', title: 'Nombre' }
]); // Sin acciones = no se muestra columna
```

## Parámetros del constructor:
```javascript
new Table(tbody, columns, actions = [], showActions = true)
```

- **`tbody`**: ID del tbody o elemento DOM
- **`columns`**: Array de configuración de columnas  
- **`actions`**: Array de acciones (opcional)
- **`showActions`**: `true`/`false` para mostrar/ocultar columna (opcional, por defecto `true`)

## Control de acciones:
- ✅ **`showActions: true`** (defecto) - Muestra columna si hay acciones
- ✅ **`showActions: false`** - Oculta columna aunque haya acciones
- ✅ **Sin acciones** - No muestra columna automáticamente

## Casos de uso:
```javascript
// Tabla de solo lectura
new Table('tbody', columns, [], false);

// Tabla con acciones condicionales
const canEdit = user.hasPermission('edit');
new Table('tbody', columns, actions, canEdit);

// Tabla completa
new Table('tbody', columns, actions, true);
```

**¡Control total sobre cuándo mostrar las acciones! 🎛️**
