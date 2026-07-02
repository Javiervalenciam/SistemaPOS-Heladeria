<div align="center">

  <img src="https://img.shields.io/badge/Electron-29.x-47848F?logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Chart.js-4.4-FF6384?logo=chartdotjs&logoColor=white" alt="Chart.js">
  <img src="https://img.shields.io/badge/IndexedDB-Dexie.js-3.2-4A90D9" alt="Dexie.js">
  <img src="https://img.shields.io/badge/Plataforma-Windows-blue?logo=windows&logoColor=white" alt="Windows">
  <img src="https://img.shields.io/badge/Licencia-ISC-green" alt="License">

  <br>

  <h1>🍦 Heladería Tropical POS</h1>

  <p>
    <strong>Sistema de Punto de Venta moderno y completo para heladerías</strong>
    <br>
    Gestión de inventario, facturación, reportes y más — todo offline, todo local.
  </p>

  <br>

  <a href="#-caracteristicas">Características</a> •
  <a href="#-capturas">Capturas</a> •
  <a href="#-tecnologias">Tecnologías</a> •
  <a href="#-instalacion">Instalación</a> •
  <a href="#-uso">Uso</a> •
  <a href="#-estructura">Estructura</a> •
  <a href="#-construir">Build</a>

  <br>
  <br>

  <img src="https://via.placeholder.com/800x450/21808d/ffffff?text=Heladeria+Tropical+POS" alt="Preview" width="700">

</div>

---

## ✨ Características

| Módulo | Descripción |
|--------|-------------|
| **📊 Dashboard** | Resumen diario con ventas, facturas, productos y alertas de stock |
| **📦 Inventario** | CRUD completo con búsqueda y filtrado por categorías |
| **🧾 Facturación** | Sistema de ventas con cálculo automático de IVA y vuelto |
| **📋 Historial** | Todas las facturas con búsqueda, filtro por fecha y paginación |
| **📈 Reportes** | Gráficos de ventas semanales, top productos y rentabilidad |
| **⚙️ Configuración** | Datos de empresa, IVA configurable, alertas de stock |
| **💾 Respaldo** | Exportación e importación de datos en JSON |

### Puntos destacados

- Sin conexión a internet — 100% offline con IndexedDB
- Descuento automático de stock al vender
- Interfaz responsive y accesible
- Colores pastel con temática de heladería
- Animaciones CSS y transiciones suaves
- Productos de ejemplo pre-cargados (paletas, helados, malteadas, sundaes)

---

## 📸 Capturas

| Dashboard | Inventario | Facturación |
|:---:|:---:|:---:|
| <img src="https://via.placeholder.com/250x160/252f3d/ffffff?text=Dashboard" width="250"> | <img src="https://via.placeholder.com/250x160/252f3d/ffffff?text=Inventario" width="250"> | <img src="https://via.placeholder.com/250x160/252f3d/ffffff?text=Facturacion" width="250"> |
| **Reportes** | **Historial** | **Configuración** |
| <img src="https://via.placeholder.com/250x160/252f3d/ffffff?text=Reportes" width="250"> | <img src="https://via.placeholder.com/250x160/252f3d/ffffff?text=Historial" width="250"> | <img src="https://via.placeholder.com/250x160/252f3d/ffffff?text=Configuracion" width="250"> |

> 💡 *Reemplaza las imágenes de placeholder con capturas reales de tu aplicación.*

---

## 🛠 Tecnologías

<div align="center">

| Frontend | Backend | Base de Datos | Librerías |
|:--------:|:-------:|:-------------:|:---------:|
| HTML5 | Electron 29 | IndexedDB | Dexie.js 3.2 |
| CSS3 | — | — | Chart.js 4.4 |
| JavaScript ES6 | — | — | Toastify-js |

</div>

### Stack detallado

- **[Electron](https://www.electronjs.org/)** — Framework de escritorio multiplataforma
- **[Dexie.js](https://dexie.org/)** — Wrapper para IndexedDB con API simple y potente
- **[Chart.js](https://www.chartjs.org/)** — Gráficos interactivos para reportes
- **[Toastify-js](https://apvarun.github.io/toastify-js/)** — Notificaciones modernas
- **[electron-builder](https://www.electron.build/)** — Empaquetado para distribución

---

## 🚀 Instalación

### Requisitos

- [Node.js](https://nodejs.org/) >= 18.x
- npm o yarn

### Pasos

```bash
# Clona el repositorio
git clone https://github.com/tu-usuario/heladeria-tropical-pos.git
cd heladeria-tropical-pos

# Instala dependencias
npm install

# Ejecuta en modo desarrollo
npm start
```

### Ejecutar sin Electron (solo web)

Abre el archivo `app/index.html` directamente en tu navegador. La aplicación funciona igual sin Electron, solo se pierde la ventana nativa.

---

## 📖 Uso

### Dashboard
Al iniciar ves el resumen del día: ventas acumuladas, número de facturas, total de productos y alertas de stock bajo.

### Inventario
- **Agregar**: Botón `+ Agregar Producto` → formulario con código, nombre, categoría, precio, stock
- **Editar**: Click en ícono de lápiz en cada tarjeta
- **Eliminar**: Click en ícono de papelera (con confirmación)
- **Buscar/Filtrar**: Barra de búsqueda + filtro por categoría

### Facturación
1. Click en `Nueva Factura`
2. Busca productos por código desde el panel derecho
3. Agrega items a la factura actual
4. Ingresa el monto pagado — el vuelto se calcula automáticamente
5. Click `Completar Venta` → el stock se descuenta automáticamente

### Reportes
- Ventas de los últimos 7 días (gráfico de barras)
- Top 5 productos más vendidos (gráfico de dona)
- Análisis de rentabilidad

### Configuración
- Datos de la empresa (nombre, dirección, teléfono, email)
- Porcentaje de IVA (defecto: 19%)
- Stock mínimo para alertas
- Exportar / Importar datos (JSON)
- Limpiar todos los datos

---

## 📁 Estructura del proyecto

```
heladeria-tropical-pos/
├── app/                        # Aplicación web
│   ├── index.html              # Interfaz principal
│   ├── style.css               # Estilos completos
│   └── app.js                  # Lógica de la aplicación
├── dist/                       # Build de distribución
│   └── win-unpacked/           # Versión portable para Windows
├── main.js                     # Entry point de Electron
├── package.json                # Configuración y dependencias
├── manual-heladeria-pos.md     # Manual de usuario detallado
└── README.md                   # Este archivo
```

---

## 📦 Construir para distribución

```bash
# Genera el ejecutable portable para Windows
npm run build
```

El instalable se generará en `dist/` como un archivo `.exe` portable listo para distribuir.

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Distribuido bajo licencia ISC. Ver `LICENSE` para más información.

---

<div align="center">

**Heladería Tropical POS** — *Cúcuta, Norte de Santander*  
<sub>Hecho con 🍨 para heladerías colombianas</sub>

</div>
