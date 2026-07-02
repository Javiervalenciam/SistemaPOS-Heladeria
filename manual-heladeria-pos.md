# 🍦 Manual de Usuario - Sistema POS Heladería Tropical

## Introducción

El Sistema POS Heladería Tropical es una aplicación web completa diseñada específicamente para la gestión de heladerías medianas en Colombia. Incluye funcionalidades de inventario, facturación, reportes y configuración, todo con respaldo local para funcionar sin conexión a internet.

## Características Principales

### ✨ Funcionalidades Implementadas

- **Gestión de Inventario**: Agregar, editar y eliminar productos con códigos únicos
- **Sistema de Facturación**: Crear facturas con cálculo automático de impuestos y vuelto
- **Control de Stock**: Descuento automático de inventario en cada venta
- **Respaldo Local**: Todas las transacciones se guardan en localStorage
- **Reportes**: Análisis de ventas, productos más vendidos y control de inventario
- **Configuración**: Personalización de empresa, impuestos y preferencias

### 🎨 Diseño Moderno

- **Colores Pasteles**: Paleta de colores suaves apropiada para heladería
- **Tipografías Google**: Roboto, Lato y Montserrat para una experiencia profesional
- **Animaciones CSS**: Transiciones suaves y efectos hover modernos
- **Responsivo**: Funciona en desktop, tablet y móvil

## Cómo Usar la Aplicación

### 1. Dashboard Principal

Al abrir la aplicación, verás el dashboard con:
- Resumen de ventas del día
- Número de transacciones
- Productos con stock bajo
- Últimas transacciones

### 2. Gestión de Inventario

**Agregar Productos:**
1. Ve a la sección "Inventario"
2. Haz clic en "Agregar Producto"
3. Completa los campos:
   - Código del producto (ej: PAL001)
   - Nombre del producto
   - Categoría
   - Precio
   - Stock inicial
   - Descripción

**Editar Productos:**
- Haz clic en el ícono de edición de cualquier producto
- Modifica los campos necesarios
- Guarda los cambios

**Eliminar Productos:**
- Haz clic en el ícono de eliminar
- Confirma la acción

### 3. Sistema de Facturación

**Crear Nueva Factura:**
1. Ve a la sección "Facturación"
2. Haz clic en "Nueva Factura"
3. Busca productos por código o nombre
4. Agrega productos a la factura
5. Verifica el subtotal, impuestos y total
6. Ingresa el monto pagado por el cliente
7. La aplicación calcula automáticamente el vuelto
8. Procesa la venta

**Características de Facturación:**
- Número de factura automático
- Cálculo de impuestos (19% IVA configurable)
- Calculadora de vuelto integrada
- Descuento automático de inventario
- Historial de todas las transacciones

### 4. Reportes y Análisis

**Tipos de Reportes:**
- **Ventas Diarias**: Resumen de ingresos del día
- **Productos Más Vendidos**: Ranking de productos por cantidad
- **Control de Stock**: Productos con stock bajo
- **Historial de Transacciones**: Todas las ventas realizadas

### 5. Configuración

**Información de la Empresa:**
- Nombre de la heladería
- Dirección
- Teléfono
- Email

**Configuración de Impuestos:**
- Porcentaje de IVA (por defecto 19%)
- Otros impuestos locales

**Alertas de Stock:**
- Nivel mínimo de inventario
- Notificaciones automáticas

## Productos de Ejemplo Incluidos

La aplicación viene con productos típicos de heladerías colombianas:

### Paletas
- Paleta de Fresa ($2,500)
- Paleta de Limón ($2,500)
- Paleta de Mango ($2,500)

### Helados Cremosos
- Helado de Vainilla ($4,000)
- Helado de Chocolate ($4,000)
- Helado de Arequipe ($4,500)

### Granizados
- Granizado de Mora ($3,500)
- Granizado de Lulo ($3,500)
- Granizado de Maracuyá ($3,500)

### Malteadas
- Malteada de Chocolate ($5,000)
- Malteada de Fresa ($5,000)
- Malteada de Vainilla ($5,000)

### Sundaes
- Sundae de Brownie ($6,500)
- Sundae Tres Leches ($6,500)
- Sundae de Frutas ($6,000)

## Respaldo y Exportación de Datos

### Respaldo Automático
- Todas las transacciones se guardan automáticamente en localStorage
- Los datos persisten incluso sin conexión a internet
- Respaldo inmediato tras cada operación

### Exportar Datos
1. Ve a "Configuración"
2. Haz clic en "Exportar Datos"
3. Se descargará un archivo JSON con todos los datos
4. Guarda este archivo como respaldo externo

### Importar Datos
1. Ve a "Configuración"
2. Haz clic en "Importar Datos"
3. Selecciona un archivo JSON previamente exportado
4. Confirma la importación

## Seguridad y Validaciones

- **Validación de Campos**: Todos los formularios tienen validación
- **Confirmaciones**: Acciones críticas requieren confirmación
- **Manejo de Errores**: Mensajes claros para problemas
- **Datos Seguros**: Información encriptada en localStorage

## Soporte Técnico

### Requisitos del Sistema
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- Mínimo 50MB de espacio en localStorage

### Resolución de Problemas

**Si la aplicación no carga:**
1. Verifica que JavaScript esté habilitado
2. Limpia la caché del navegador
3. Actualiza la página

**Si los datos no se guardan:**
1. Verifica que el navegador permita localStorage
2. Libera espacio en el navegador
3. Exporta los datos como respaldo

**Si hay errores de cálculo:**
1. Verifica la configuración de impuestos
2. Revisa los precios de los productos
3. Confirma que los números estén en formato correcto

## Personalización

### Cambiar Colores de la Empresa
1. Ve a "Configuración"
2. Selecciona "Tema"
3. Elige entre paletas de colores disponibles

### Agregar Nuevas Categorías
1. Ve a "Inventario"
2. Al crear un producto, puedes agregar nueva categoría
3. La categoría se guardará automáticamente

### Modificar Información de la Empresa
1. Ve a "Configuración"
2. Edita los campos de información
3. Guarda los cambios

## Mejores Prácticas

### Para Mejor Rendimiento
- Mantén el inventario actualizado
- Realiza respaldos regulares
- Limpia transacciones antiguas periódicamente

### Para Mejor Seguridad
- Exporta datos semanalmente
- No compartas archivos de respaldo
- Usa la aplicación en navegadores seguros

### Para Mejor Control
- Revisa reportes diariamente
- Monitorea stock bajo
- Actualiza precios regularmente

## Actualizaciones Futuras

La aplicación está diseñada para ser ampliable con:
- Integración con impresoras de tickets
- Conexión a bases de datos en la nube
- Módulo de empleados y turnos
- Integración con sistemas de pago electrónico
- Reportes avanzados y análisis predictivo

---

**Desarrollado para Heladería Tropical - Cúcuta, Norte de Santander**

*Sistema POS completo y profesional para la gestión integral de heladerías*