// Sistema POS Heladería Tropical - IndexedDB Version with Dexie.js

// Database setup using Dexie.js
const db = new Dexie("HeladeriaTropicalDB");

// Database schema
db.version(1).stores({
  products: "++id, code, name, category, price, stock, description",
  invoices: "++id, date, total, subtotal, tax, paid, change",
  details: "++id, invoiceId, productId, code, name, price, quantity, total",
  categories: "++id, &name",
  settings: "id, iva, stockMin, lastBackup",
  company: "id, name, address, phone, email"
});

// Global state variables
let currentInvoice = [];
let editingProductId = null;
let currentPageInvoices = 1;
let totalPagesInvoices = 1;
const PAGE_SIZE = 10;

// Utility functions
function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('active');
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('active');
}

function showToast(message, type = 'success') {
  const toastConfig = {
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    style: {
      background: type === 'success' ? '#68d391' : 
                 type === 'error' ? '#fc8181' : 
                 type === 'warning' ? '#fbb040' : '#63b3ed'
    }
  };
  
  if (typeof Toastify !== 'undefined') {
    Toastify(toastConfig).showToast();
  } else {
    console.log(`Toast [${type}]: ${message}`);
  }
}

function validatePrice(price) {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice >= 0;
}

function validateQuantity(quantity) {
  const numQty = parseInt(quantity);
  return !isNaN(numQty) && numQty >= 0;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
}

// Database initialization and seed data
async function initializeDB() {
  showLoading();
  
  try {
    await db.open();
    
    // Check if database is empty and seed with sample data
    const productCount = await db.products.count();
    
    if (productCount === 0) {
      await seedDatabase();
    }
    
    // Check backup reminder
    await checkBackupReminder();
    
  } catch (error) {
    console.error('Error initializing database:', error);
    showToast('Error al inicializar la base de datos', 'error');
  } finally {
    hideLoading();
  }
}

async function seedDatabase() {
  try {
    // Seed categories
    await db.categories.bulkAdd([
      { name: "Paletas" },
      { name: "Helados" },
      { name: "Granizados" },
      { name: "Malteadas" },
      { name: "Sundaes" }
    ]);

    // Seed products
    const sampleProducts = [
      { code: "PAL001", name: "Paleta de Fresa", category: "Paletas", price: 2500, stock: 50, description: "Paleta de agua sabor fresa natural" },
      { code: "PAL002", name: "Paleta de Limón", category: "Paletas", price: 2500, stock: 45, description: "Paleta de agua sabor limón natural" },
      { code: "PAL003", name: "Paleta de Mango", category: "Paletas", price: 2500, stock: 40, description: "Paleta de agua sabor mango natural" },
      { code: "HEL001", name: "Helado de Vainilla", category: "Helados", price: 4000, stock: 30, description: "Helado cremoso sabor vainilla" },
      { code: "HEL002", name: "Helado de Chocolate", category: "Helados", price: 4000, stock: 35, description: "Helado cremoso sabor chocolate" },
      { code: "HEL003", name: "Helado de Arequipe", category: "Helados", price: 4500, stock: 25, description: "Helado cremoso sabor arequipe" },
      { code: "GRA001", name: "Granizado de Mora", category: "Granizados", price: 3500, stock: 20, description: "Granizado de mora natural" },
      { code: "GRA002", name: "Granizado de Lulo", category: "Granizados", price: 3500, stock: 18, description: "Granizado de lulo natural" },
      { code: "GRA003", name: "Granizado de Maracuyá", category: "Granizados", price: 3500, stock: 22, description: "Granizado de maracuyá natural" },
      { code: "MAL001", name: "Malteada de Chocolate", category: "Malteadas", price: 5000, stock: 15, description: "Malteada cremosa de chocolate" },
      { code: "MAL002", name: "Malteada de Fresa", category: "Malteadas", price: 5000, stock: 12, description: "Malteada cremosa de fresa" },
      { code: "MAL003", name: "Malteada de Vainilla", category: "Malteadas", price: 5000, stock: 10, description: "Malteada cremosa de vainilla" },
      { code: "SUN001", name: "Sundae de Brownie", category: "Sundaes", price: 6500, stock: 8, description: "Sundae con brownie y helado" },
      { code: "SUN002", name: "Sundae Tres Leches", category: "Sundaes", price: 6500, stock: 6, description: "Sundae con torta tres leches" },
      { code: "SUN003", name: "Sundae de Frutas", category: "Sundaes", price: 6000, stock: 10, description: "Sundae con frutas frescas" }
    ];

    await db.products.bulkAdd(sampleProducts);

    // Seed company info
    await db.company.add({
      id: 1,
      name: "Heladería Tropical",
      address: "Av. Libertadores #123, Cúcuta",
      phone: "607-1234567",
      email: "info@heladeria-tropical.com"
    });

    // Seed settings
    await db.settings.add({
      id: 1,
      iva: 0,
      stockMin: 5,
      lastBackup: Date.now()
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

async function checkBackupReminder() {
  try {
    const settings = await db.settings.get(1);
    if (settings && settings.lastBackup) {
      const daysSinceBackup = (Date.now() - settings.lastBackup) / (1000 * 60 * 60 * 24);
      if (daysSinceBackup > 3) {
        showToast(`Último respaldo hace ${Math.floor(daysSinceBackup)} días. ¡Haz una copia de seguridad!`, 'warning');
      }
    }
  } catch (error) {
    console.error('Error checking backup reminder:', error);
  }
}

// Navigation functions
function showSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.classList.remove('active'));
  
  // Show target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  // Update navigation active state
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));
  
  const activeNavLink = document.querySelector(`[data-section="${sectionId}"]`);
  if (activeNavLink) {
    activeNavLink.classList.add('active');
  }
  
  // Load section-specific data
  setTimeout(async () => {
    switch(sectionId) {
      case 'dashboard':
        await loadDashboard();
        break;
      case 'inventory':
        await loadInventory();
        break;
      case 'sales':
        await loadSales();
        break;
      case 'invoice-history':
        await loadInvoiceHistory();
        break;
      case 'reports':
        await loadReports();
        break;
      case 'settings':
        await loadSettings();
        break;
    }
  }, 50);
}

// Dashboard functions
async function loadDashboard() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's invoices
    const todayInvoices = await db.invoices
      .where('date')
      .between(today.toISOString(), tomorrow.toISOString())
      .toArray();

    // Calculate daily sales
    const dailySales = todayInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const dailyInvoicesCount = todayInvoices.length;

    // Get total products and low stock
    const products = await db.products.toArray();
    const settings = await db.settings.get(1);
    const stockMin = settings ? settings.stockMin : 5;
    const lowStockCount = products.filter(p => p.stock < stockMin).length;

    // Update dashboard stats
    document.getElementById('daily-sales').textContent = formatCurrency(dailySales);
    document.getElementById('daily-invoices').textContent = dailyInvoicesCount;
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('low-stock').textContent = lowStockCount;

    // Load recent sales
    const recentInvoices = await db.invoices
      .orderBy('date')
      .reverse()
      .limit(5)
      .toArray();

    const recentSalesList = document.getElementById('recent-sales-list');
    if (recentSalesList) {
      if (recentInvoices.length === 0) {
        recentSalesList.innerHTML = '<p>No hay ventas recientes</p>';
      } else {
        recentSalesList.innerHTML = recentInvoices.map(invoice => `
          <div class="sale-item">
            <div class="sale-info">
              <strong>Factura #${invoice.id}</strong>
              <span class="sale-date">${new Date(invoice.date).toLocaleString()}</span>
            </div>
            <div class="sale-amount">${formatCurrency(invoice.total)}</div>
          </div>
        `).join('');
      }
    }

    // Load low stock products
    const lowStockProducts = products.filter(p => p.stock < stockMin);
    const lowStockList = document.getElementById('low-stock-list');
    if (lowStockList) {
      if (lowStockProducts.length === 0) {
        lowStockList.innerHTML = '<p>No hay productos con stock bajo</p>';
      } else {
        lowStockList.innerHTML = lowStockProducts.map(product => `
          <div class="stock-item">
            <div class="stock-info">
              <strong>${product.name}</strong>
              <span class="stock-code">${product.code}</span>
            </div>
            <div class="stock-amount ${product.stock === 0 ? 'out-of-stock' : 'low-stock'}">
              ${product.stock} unidades
            </div>
          </div>
        `).join('');
      }
    }

  } catch (error) {
    console.error('Error loading dashboard:', error);
    showToast('Error al cargar el dashboard', 'error');
  }
}

// Inventory functions
async function loadInventory() {
  try {
    await loadCategoryFilter();
    await displayProducts();
  } catch (error) {
    console.error('Error loading inventory:', error);
    showToast('Error al cargar el inventario', 'error');
  }
}

async function loadCategoryFilter() {
  try {
    const categories = await db.categories.toArray();
    const categoryFilter = document.getElementById('category-filter');
    const productCategory = document.getElementById('product-category');
    
    if (categoryFilter) {
      categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
      categories.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category.name}">${category.name}</option>`;
      });
    }
    
    if (productCategory) {
      productCategory.innerHTML = '<option value="">Seleccionar categoría</option>';
      categories.forEach(category => {
        productCategory.innerHTML += `<option value="${category.name}">${category.name}</option>`;
      });
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

async function displayProducts() {
  try {
    const searchTerm = document.getElementById('product-search')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('category-filter')?.value || '';
    
    let query = db.products.toCollection();
    
    if (searchTerm) {
      query = query.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.code.toLowerCase().includes(searchTerm)
      );
    }
    
    if (categoryFilter) {
      query = query.filter(product => product.category === categoryFilter);
    }
    
    const products = await query.toArray();
    const settings = await db.settings.get(1);
    const stockMin = settings ? settings.stockMin : 5;
    
    const inventoryGrid = document.getElementById('inventory-grid');
    if (!inventoryGrid) return;
    
    if (products.length === 0) {
      inventoryGrid.innerHTML = '<p>No hay productos para mostrar</p>';
      return;
    }
    
    inventoryGrid.innerHTML = products.map(product => {
      const stockClass = product.stock === 0 ? 'out' : product.stock < stockMin ? 'low' : 'good';
      
      return `
        <div class="product-card">
          <div class="product-header">
            <span class="product-code">${product.code}</span>
            <div class="product-actions">
              <button class="btn btn--secondary btn--sm" onclick="editProduct(${product.id})" type="button">✏️</button>
              <button class="btn btn--outline btn--sm" onclick="deleteProduct(${product.id})" type="button">🗑️</button>
            </div>
          </div>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-category">${product.category}</p>
          <div class="product-price">${formatCurrency(product.price)}</div>
          <div class="product-stock">
            <span class="stock-indicator ${stockClass}"></span>
            <span>Stock: ${product.stock}</span>
          </div>
          <p class="product-description">${product.description || ''}</p>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error displaying products:', error);
    showToast('Error al mostrar productos', 'error');
  }
}

async function showAddProductModal() {
  editingProductId = null;
  
  const modalTitle = document.getElementById('product-modal-title');
  const productForm = document.getElementById('product-form');
  const productModal = document.getElementById('product-modal');
  
  if (modalTitle) modalTitle.textContent = 'Agregar Producto';
  if (productForm) productForm.reset();
  
  // CRITICAL FIX: Load categories when opening add product modal
  await loadProductCategoryDropdown();
  
  if (productModal) productModal.classList.add('active');
}

// CRITICAL FIX: Separate function to load product category dropdown
async function loadProductCategoryDropdown() {
  try {
    const categories = await db.categories.toArray();
    const productCategory = document.getElementById('product-category');
    
    if (productCategory) {
      productCategory.innerHTML = '<option value="">Seleccionar categoría</option>';
      categories.forEach(category => {
        productCategory.innerHTML += `<option value="${category.name}">${category.name}</option>`;
      });
    }
  } catch (error) {
    console.error('Error loading product categories:', error);
  }
}

async function editProduct(productId) {
  try {
    const product = await db.products.get(productId);
    if (!product) return;
    
    editingProductId = productId;
    
    const modalTitle = document.getElementById('product-modal-title');
    if (modalTitle) modalTitle.textContent = 'Editar Producto';
    
    // CRITICAL FIX: Load categories first, then populate form
    await loadProductCategoryDropdown();
    
    // Fill form with product data
    document.getElementById('product-code').value = product.code;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-description').value = product.description || '';
    
    const productModal = document.getElementById('product-modal');
    if (productModal) productModal.classList.add('active');
    
  } catch (error) {
    console.error('Error editing product:', error);
    showToast('Error al editar producto', 'error');
  }
}

function hideProductModal() {
  const productModal = document.getElementById('product-modal');
  if (productModal) productModal.classList.remove('active');
  editingProductId = null;
}

async function saveProduct() {
  try {
    const form = document.getElementById('product-form');
    if (!form || !form.checkValidity()) {
      if (form) form.reportValidity();
      return;
    }
    
    const code = document.getElementById('product-code').value.trim();
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const description = document.getElementById('product-description').value.trim();
    
    // Validations
    if (!validatePrice(price)) {
      showToast('El precio debe ser un número válido mayor o igual a 0', 'error');
      return;
    }
    
    if (!validateQuantity(stock)) {
      showToast('El stock debe ser un número válido mayor o igual a 0', 'error');
      return;
    }
    
    // Check for duplicate code
    if (!editingProductId) {
      const existingProduct = await db.products.where('code').equals(code).first();
      if (existingProduct) {
        showToast('Ya existe un producto con este código', 'error');
        return;
      }
    }
    
    const productData = {
      code,
      name,
      category,
      price,
      stock,
      description
    };
    
    if (editingProductId) {
      await db.products.update(editingProductId, productData);
      showToast('Producto actualizado exitosamente');
    } else {
      await db.products.add(productData);
      showToast('Producto agregado exitosamente');
    }
    
    hideProductModal();
    await displayProducts();
    await loadDashboard();
    
  } catch (error) {
    console.error('Error saving product:', error);
    showToast('Error al guardar producto', 'error');
  }
}

async function deleteProduct(productId) {
  try {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      await db.products.delete(productId);
      showToast('Producto eliminado exitosamente');
      await displayProducts();
      await loadDashboard();
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    showToast('Error al eliminar producto', 'error');
  }
}

// Sales functions
async function loadSales() {
  try {
    await displayProductsForSale();
    updateInvoiceDisplay();
    
    const settings = await db.settings.get(1);
    const taxRate = settings ? settings.iva : 0;
    
    const taxRateLabel = document.getElementById('tax-rate-label');
    if (taxRateLabel) {
      taxRateLabel.textContent = taxRate;
    }
    
  } catch (error) {
    console.error('Error loading sales:', error);
    showToast('Error al cargar ventas', 'error');
  }
}

async function displayProductsForSale() {
  try {
    const searchTerm = document.getElementById('sales-product-search')?.value.toLowerCase() || '';
    
    let query = db.products.where('stock').above(0);
    
    if (searchTerm) {
      query = query.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.code.toLowerCase().includes(searchTerm)
      );
    }
    
    const products = await query.toArray();
    const productsGrid = document.getElementById('sales-product-grid');
    
    if (!productsGrid) return;
    
    if (products.length === 0) {
      productsGrid.innerHTML = '<p>No hay productos disponibles</p>';
      return;
    }
    
    productsGrid.innerHTML = products.map(product => `
      <div class="product-item" onclick="addToInvoice(${product.id})" style="cursor: pointer;">
        <div class="product-code">${product.code}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-price">${formatCurrency(product.price)}</div>
        <div class="product-stock">Stock: ${product.stock}</div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error displaying products for sale:', error);
    showToast('Error al mostrar productos para venta', 'error');
  }
}

async function addToInvoice(productId) {
  try {
    const product = await db.products.get(productId);
    if (!product || product.stock === 0) return;
    
    const existingItem = currentInvoice.find(item => item.productId === productId);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++;
        existingItem.total = existingItem.quantity * existingItem.price;
      } else {
        showToast('No hay suficiente stock disponible', 'warning');
        return;
      }
    } else {
      currentInvoice.push({
        productId: productId,
        code: product.code,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price
      });
    }
    
    updateInvoiceDisplay();
    showToast('Producto agregado a la factura');
    
  } catch (error) {
    console.error('Error adding to invoice:', error);
    showToast('Error al agregar producto', 'error');
  }
}

function removeFromInvoice(productId) {
  currentInvoice = currentInvoice.filter(item => item.productId !== productId);
  updateInvoiceDisplay();
}

async function changeQuantity(productId, change) {
  try {
    const item = currentInvoice.find(item => item.productId === productId);
    const product = await db.products.get(productId);
    
    if (!item || !product) return;
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
      removeFromInvoice(productId);
      return;
    }
    
    if (newQuantity > product.stock) {
      showToast('No hay suficiente stock disponible', 'warning');
      return;
    }
    
    item.quantity = newQuantity;
    item.total = item.quantity * item.price;
    
    updateInvoiceDisplay();
    
  } catch (error) {
    console.error('Error changing quantity:', error);
    showToast('Error al cambiar cantidad', 'error');
  }
}

async function updateInvoiceDisplay() {
  const invoiceItems = document.getElementById('current-invoice-items');
  if (!invoiceItems) return;
  
  if (currentInvoice.length === 0) {
    invoiceItems.innerHTML = '<p>No hay productos en la factura</p>';
    updateInvoiceTotals(0, 0, 0);
    return;
  }
  
  invoiceItems.innerHTML = currentInvoice.map(item => `
    <div class="invoice-item">
      <div class="item-info">
        <strong>${item.name}</strong>
        <span class="item-code">${item.code}</span>
      </div>
      <div class="item-quantity">
        <button onclick="changeQuantity(${item.productId}, -1)" type="button">-</button>
        <span>${item.quantity}</span>
        <button onclick="changeQuantity(${item.productId}, 1)" type="button">+</button>
      </div>
      <div class="item-price">${formatCurrency(item.total)}</div>
      <button onclick="removeFromInvoice(${item.productId})" class="btn btn--outline btn--sm" type="button">🗑️</button>
    </div>
  `).join('');
  
  const subtotal = currentInvoice.reduce((sum, item) => sum + item.total, 0);
  
  try {
    const settings = await db.settings.get(1);
    const taxRate = settings ? settings.iva : 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    
    updateInvoiceTotals(subtotal, tax, total);
  } catch (error) {
    console.error('Error updating invoice totals:', error);
  }
}

function updateInvoiceTotals(subtotal, tax, total) {
  document.getElementById('invoice-subtotal').textContent = formatCurrency(subtotal);
  document.getElementById('invoice-tax').textContent = formatCurrency(tax);
  document.getElementById('invoice-total').textContent = formatCurrency(total);
  calculateChange();
}

function calculateChange() {
  const totalElement = document.getElementById('invoice-total');
  const paymentElement = document.getElementById('payment-amount');
  const changeElement = document.getElementById('change-amount');
  
  if (!totalElement || !paymentElement || !changeElement) return;
  
  const totalText = totalElement.textContent.replace(/[^\d]/g, '');
  const total = parseFloat(totalText) || 0;
  const payment = parseFloat(paymentElement.value) || 0;
  
  const change = payment - total;
  changeElement.textContent = formatCurrency(Math.max(0, change));
  changeElement.style.color = change >= 0 ? 'green' : 'red';
}

function startNewInvoice() {
  currentInvoice = [];
  const paymentAmount = document.getElementById('payment-amount');
  if (paymentAmount) paymentAmount.value = '';
  updateInvoiceDisplay();
  showToast('Nueva factura iniciada');
}

async function completeSale() {
  try {
    if (currentInvoice.length === 0) {
      showToast('No hay productos en la factura', 'warning');
      return;
    }
    
    const totalElement = document.getElementById('invoice-total');
    const paymentElement = document.getElementById('payment-amount');
    
    if (!totalElement || !paymentElement) return;
    
    const totalText = totalElement.textContent.replace(/[^\d]/g, '');
    const total = parseFloat(totalText) || 0;
    const payment = parseFloat(paymentElement.value) || 0;
    
    if (payment < total) {
      showToast('El pago recibido es insuficiente', 'error');
      return;
    }
    
    showLoading();
    
    // Use transaction to ensure data consistency
    await db.transaction('rw', db.invoices, db.details, db.products, async () => {
      // Create invoice
      const invoiceId = await db.invoices.add({
        date: new Date().toISOString(),
        subtotal: parseFloat(document.getElementById('invoice-subtotal').textContent.replace(/[^\d]/g, '')) || 0,
        tax: parseFloat(document.getElementById('invoice-tax').textContent.replace(/[^\d]/g, '')) || 0,
        total: total,
        paid: payment,
        change: payment - total
      });
      
      // Save invoice details and update stock
      for (const item of currentInvoice) {
        await db.details.add({
          invoiceId: invoiceId,
          productId: item.productId,
          code: item.code,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.total
        });
        
        // Update product stock
        await db.products.where('id').equals(item.productId).modify(product => {
          product.stock -= item.quantity;
        });
      }
    });
    
    // Reset current invoice
    currentInvoice = [];
    if (paymentElement) paymentElement.value = '';
    updateInvoiceDisplay();
    await displayProductsForSale();
    await loadDashboard();
    
    showToast('Venta completada exitosamente');
    
  } catch (error) {
    console.error('Error completing sale:', error);
    showToast('Error al completar la venta', 'error');
  } finally {
    hideLoading();
  }
}

// Invoice History functions
async function loadInvoiceHistory() {
  try {
    const totalInvoices = await db.invoices.count();
    totalPagesInvoices = Math.ceil(totalInvoices / PAGE_SIZE);
    
    const totalInvoicesCount = document.getElementById('total-invoices-count');
    if (totalInvoicesCount) {
      totalInvoicesCount.textContent = `${totalInvoices} facturas`;
    }
    
    await displayInvoiceHistory();
    updatePaginationControls();
    
  } catch (error) {
    console.error('Error loading invoice history:', error);
    showToast('Error al cargar historial de facturas', 'error');
  }
}

async function displayInvoiceHistory() {
  try {
    const searchTerm = document.getElementById('invoice-search')?.value || '';
    const dateFilter = document.getElementById('date-filter')?.value || '';
    
    let query = db.invoices.orderBy('date').reverse();
    
    if (searchTerm) {
      query = query.filter(invoice => invoice.id.toString().includes(searchTerm));
    }
    
    if (dateFilter) {
      const selectedDate = new Date(dateFilter);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query = query.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= selectedDate && invoiceDate < nextDay;
      });
    }
    
    const offset = (currentPageInvoices - 1) * PAGE_SIZE;
    const invoices = await query.offset(offset).limit(PAGE_SIZE).toArray();
    
    const historyGrid = document.getElementById('invoice-history-grid');
    if (!historyGrid) return;
    
    if (invoices.length === 0) {
      historyGrid.innerHTML = '<p>No hay facturas registradas</p>';
      return;
    }
    
    historyGrid.innerHTML = invoices.map(invoice => `
      <div class="invoice-history-item">
        <div class="invoice-info">
          <strong>Factura #${invoice.id}</strong>
          <span class="invoice-date">${new Date(invoice.date).toLocaleString()}</span>
        </div>
        <div class="invoice-total">${formatCurrency(invoice.total)}</div>
        <div class="invoice-actions">
          <button class="btn btn--secondary btn--sm" onclick="viewInvoice(${invoice.id})" type="button">👁️ Ver</button>
          <button class="btn btn--outline btn--sm" onclick="editInvoiceFromHistory(${invoice.id})" type="button">✏️ Editar</button>
          <button class="btn btn--danger btn--sm" onclick="deleteInvoice(${invoice.id})" type="button">🗑️ Eliminar</button>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error displaying invoice history:', error);
    showToast('Error al mostrar historial de facturas', 'error');
  }
}

function updatePaginationControls() {
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');
  
  if (prevBtn) prevBtn.disabled = currentPageInvoices <= 1;
  if (nextBtn) nextBtn.disabled = currentPageInvoices >= totalPagesInvoices;
  if (pageInfo) pageInfo.textContent = `Página ${currentPageInvoices} de ${totalPagesInvoices}`;
}

async function prevPage() {
  if (currentPageInvoices > 1) {
    currentPageInvoices--;
    await displayInvoiceHistory();
    updatePaginationControls();
  }
}

async function nextPage() {
  if (currentPageInvoices < totalPagesInvoices) {
    currentPageInvoices++;
    await displayInvoiceHistory();
    updatePaginationControls();
  }
}

async function viewInvoice(invoiceId) {
  try {
    const invoice = await db.invoices.get(invoiceId);
    const details = await db.details.where('invoiceId').equals(invoiceId).toArray();
    const company = await db.company.get(1);
    
    if (!invoice) return;
    
    const modal = document.getElementById('invoice-view-modal');
    const content = document.getElementById('invoice-view-content');
    
    if (content) {
      content.innerHTML = `
        <div class="invoice-header">
          <h3>${company ? company.name : 'Heladería Tropical'}</h3>
          <p>${company ? company.address : ''}</p>
          <p>Tel: ${company ? company.phone : ''}</p>
        </div>
        <div class="invoice-details">
          <h4>Factura #${invoice.id}</h4>
          <p>Fecha: ${new Date(invoice.date).toLocaleString()}</p>
        </div>
        <div class="invoice-items">
          <h4>Productos</h4>
          ${details.map(detail => `
            <div class="invoice-item">
              <span>${detail.name} (${detail.code})</span>
              <span>${detail.quantity} x ${formatCurrency(detail.price)}</span>
              <span>${formatCurrency(detail.total)}</span>
            </div>
          `).join('')}
        </div>
        <div class="invoice-summary">
          <div class="summary-line">
            <span>Subtotal:</span>
            <span>${formatCurrency(invoice.subtotal)}</span>
          </div>
          <div class="summary-line">
            <span>IVA:</span>
            <span>${formatCurrency(invoice.tax)}</span>
          </div>
          <div class="summary-line total">
            <span>Total:</span>
            <span>${formatCurrency(invoice.total)}</span>
          </div>
          <div class="summary-line">
            <span>Pagado:</span>
            <span>${formatCurrency(invoice.paid)}</span>
          </div>
          <div class="summary-line">
            <span>Cambio:</span>
            <span>${formatCurrency(invoice.change)}</span>
          </div>
        </div>
      `;
    }
    
    if (modal) modal.classList.add('active');
    
  } catch (error) {
    console.error('Error viewing invoice:', error);
    showToast('Error al ver la factura', 'error');
  }
}

async function editInvoiceFromHistory(invoiceId) {
  try {
    const invoice = await db.invoices.get(invoiceId);
    const details = await db.details.where('invoiceId').equals(invoiceId).toArray();
    
    if (!invoice || !details) return;
    
    // Load invoice data into current invoice
    currentInvoice = details.map(detail => ({
      productId: detail.productId,
      code: detail.code,
      name: detail.name,
      price: detail.price,
      quantity: detail.quantity,
      total: detail.total
    }));
    
    // Switch to sales section
    showSection('sales');
    
    showToast('Factura cargada para edición');
    
  } catch (error) {
    console.error('Error editing invoice:', error);
    showToast('Error al editar factura', 'error');
  }
}

async function deleteInvoice(invoiceId) {
  try {
    if (confirm('¿Estás seguro de que deseas eliminar esta factura? Esta acción restaurará el stock de los productos.')) {
      showLoading();
      
      await db.transaction('rw', db.invoices, db.details, db.products, async () => {
        // Get invoice details to restore stock
        const details = await db.details.where('invoiceId').equals(invoiceId).toArray();
        
        // Restore stock
        for (const detail of details) {
          await db.products.where('id').equals(detail.productId).modify(product => {
            product.stock += detail.quantity;
          });
        }
        
        // Delete invoice and details
        await db.details.where('invoiceId').equals(invoiceId).delete();
        await db.invoices.delete(invoiceId);
      });
      
      await loadInvoiceHistory();
      await loadDashboard();
      await displayProductsForSale();
      
      showToast('Factura eliminada exitosamente');
    }
  } catch (error) {
    console.error('Error deleting invoice:', error);
    showToast('Error al eliminar factura', 'error');
  } finally {
    hideLoading();
  }
}

// Reports functions
async function loadReports() {
  try {
    await displaySalesChart();
    await displayTopProductsChart();
    await displayProfitabilityAnalysis();
  } catch (error) {
    console.error('Error loading reports:', error);
    showToast('Error al cargar reportes', 'error');
  }
}

async function displaySalesChart() {
  const canvas = document.getElementById('daily-sales-chart');
  if (!canvas) return;
  
  try {
    const ctx = canvas.getContext('2d');
    
    // Get last 7 days of sales
    const last7Days = [];
    const salesData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayInvoices = await db.invoices
        .where('date')
        .between(date.toISOString(), nextDay.toISOString())
        .toArray();
      
      const dayTotal = dayInvoices.reduce((sum, inv) => sum + inv.total, 0);
      
      last7Days.push(date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }));
      salesData.push(dayTotal);
    }
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: last7Days,
        datasets: [{
          label: 'Ventas',
          data: salesData,
          backgroundColor: '#1FB8CD',
          borderColor: '#1FB8CD',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value);
              }
            }
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error displaying sales chart:', error);
  }
}

async function displayTopProductsChart() {
  const canvas = document.getElementById('top-products-chart');
  if (!canvas) return;
  
  try {
    const ctx = canvas.getContext('2d');
    
    // Get top 5 products by sales
    const productSales = {};
    const details = await db.details.toArray();
    
    details.forEach(detail => {
      if (!productSales[detail.name]) {
        productSales[detail.name] = 0;
      }
      productSales[detail.name] += detail.quantity;
    });
    
    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    const labels = topProducts.map(([name]) => name);
    const data = topProducts.map(([, quantity]) => quantity);
    const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error displaying top products chart:', error);
  }
}

async function displayProfitabilityAnalysis() {
  try {
    const invoices = await db.invoices.toArray();
    
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const totalTax = invoices.reduce((sum, invoice) => sum + invoice.tax, 0);
    const totalSubtotal = invoices.reduce((sum, invoice) => sum + invoice.subtotal, 0);
    
    const profitabilityAnalysis = document.getElementById('profitability-analysis');
    if (!profitabilityAnalysis) return;
    
    profitabilityAnalysis.innerHTML = `
      <div class="profit-item">
        <span class="profit-label">Ingresos Totales:</span>
        <span class="profit-value">${formatCurrency(totalRevenue)}</span>
      </div>
      <div class="profit-item">
        <span class="profit-label">Subtotal:</span>
        <span class="profit-value">${formatCurrency(totalSubtotal)}</span>
      </div>
      <div class="profit-item">
        <span class="profit-label">Impuestos Recaudados:</span>
        <span class="profit-value">${formatCurrency(totalTax)}</span>
      </div>
      <div class="profit-item">
        <span class="profit-label">Número de Transacciones:</span>
        <span class="profit-value">${invoices.length}</span>
      </div>
      <div class="profit-item">
        <span class="profit-label">Promedio por Venta:</span>
        <span class="profit-value">${formatCurrency(invoices.length > 0 ? totalRevenue / invoices.length : 0)}</span>
      </div>
    `;
    
  } catch (error) {
    console.error('Error displaying profitability analysis:', error);
  }
}

// Settings functions
async function loadSettings() {
  try {
    const company = await db.company.get(1);
    const settings = await db.settings.get(1);
    
    if (company) {
      document.getElementById('company-name').value = company.name || '';
      document.getElementById('company-address').value = company.address || '';
      document.getElementById('company-phone').value = company.phone || '';
      document.getElementById('company-email').value = company.email || '';
    }
    
    if (settings) {
      document.getElementById('tax-rate').value = settings.iva || 0;
      document.getElementById('stock-minimum').value = settings.stockMin || 5;
      
      const lastBackupDate = document.getElementById('last-backup-date');
      if (lastBackupDate && settings.lastBackup) {
        const backupDate = new Date(settings.lastBackup);
        lastBackupDate.textContent = backupDate.toLocaleDateString();
      }
    }
    
  } catch (error) {
    console.error('Error loading settings:', error);
    showToast('Error al cargar configuración', 'error');
  }
}

async function saveCompanyInfo() {
  try {
    const companyData = {
      name: document.getElementById('company-name').value,
      address: document.getElementById('company-address').value,
      phone: document.getElementById('company-phone').value,
      email: document.getElementById('company-email').value
    };
    
    await db.company.put({ id: 1, ...companyData });
    showToast('Información de la empresa guardada');
    
  } catch (error) {
    console.error('Error saving company info:', error);
    showToast('Error al guardar información de la empresa', 'error');
  }
}

async function saveTaxSettings() {
  try {
    const taxRate = parseFloat(document.getElementById('tax-rate').value);
    const stockMin = parseInt(document.getElementById('stock-minimum').value);
    
    if (!validatePrice(taxRate) || taxRate > 100) {
      showToast('Porcentaje de IVA inválido (0-100)', 'error');
      return;
    }
    
    if (!validateQuantity(stockMin)) {
      showToast('Stock mínimo inválido', 'error');
      return;
    }
    
    await db.settings.put({
      id: 1,
      iva: taxRate,
      stockMin: stockMin,
      lastBackup: (await db.settings.get(1))?.lastBackup || Date.now()
    });
    
    // Update tax rate label in sales section
    const taxRateLabel = document.getElementById('tax-rate-label');
    if (taxRateLabel) {
      taxRateLabel.textContent = taxRate;
    }
    
    // Refresh current invoice if in sales section
    if (currentInvoice.length > 0) {
      updateInvoiceDisplay();
    }
    
    await loadDashboard();
    showToast('Configuración de impuestos guardada');
    
  } catch (error) {
    console.error('Error saving tax settings:', error);
    showToast('Error al guardar configuración de impuestos', 'error');
  }
}

async function exportData() {
  try {
    showLoading();
    
    const data = {
      products: await db.products.toArray(),
      invoices: await db.invoices.toArray(),
      details: await db.details.toArray(),
      categories: await db.categories.toArray(),
      settings: await db.settings.toArray(),
      company: await db.company.toArray()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heladeria-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Update last backup date
    await db.settings.put({
      id: 1,
      iva: (await db.settings.get(1))?.iva || 0,
      stockMin: (await db.settings.get(1))?.stockMin || 5,
      lastBackup: Date.now()
    });
    
    showToast('Datos exportados exitosamente');
    
  } catch (error) {
    console.error('Error exporting data:', error);
    showToast('Error al exportar datos', 'error');
  } finally {
    hideLoading();
  }
}

async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  showLoading();
  
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      // Verify data structure
      if (!data.products || !data.invoices) {
        throw new Error('El archivo no parece ser un respaldo válido.');
      }
      
      // Clear existing data and import
      await db.transaction('rw', db.products, db.invoices, db.details, db.categories, db.settings, db.company, async () => {
        await db.products.clear();
        await db.invoices.clear();
        await db.details.clear();
        await db.categories.clear();
        await db.settings.clear();
        await db.company.clear();
        
        if (data.products) await db.products.bulkAdd(data.products);
        if (data.invoices) await db.invoices.bulkAdd(data.invoices);
        if (data.details) await db.details.bulkAdd(data.details);
        if (data.categories) await db.categories.bulkAdd(data.categories);
        if (data.settings) await db.settings.bulkAdd(data.settings);
        if (data.company) await db.company.bulkAdd(data.company);
      });
      
      await loadDashboard();
      await loadInventory();
      await loadSettings();
      
      showToast('Datos importados exitosamente');
      
    } catch (error) {
      console.error('Import error:', error);
      showToast(error.message || 'Error al importar datos', 'error');
    } finally {
      hideLoading();
    }
  };
  
  reader.readAsText(file);
}

async function clearAllData() {
  if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
    try {
      showLoading();
      
      await db.transaction('rw', db.products, db.invoices, db.details, db.categories, db.settings, db.company, async () => {
        await db.products.clear();
        await db.invoices.clear();
        await db.details.clear();
        await db.categories.clear();
        await db.settings.clear();
        await db.company.clear();
      });
      
      showToast('Todos los datos han sido eliminados');
      location.reload();
      
    } catch (error) {
      console.error('Error clearing data:', error);
      showToast('Error al limpiar datos', 'error');
    } finally {
      hideLoading();
    }
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
  await initializeDB();
  // --- Lógica para el menú de hamburguesa ---
const hamburgerBtn = document.getElementById('hamburger-btn');
const sidebar = document.querySelector('.sidebar');
const appContainer = document.querySelector('.app-container');
const openIcon = document.querySelector('.hamburger-icon');
const closeIcon = document.querySelector('.close-icon');

hamburgerBtn.addEventListener('click', () => {
    // Muestra/oculta el sidebar y empuja el contenido
    appContainer.classList.toggle('sidebar-open');

    // Cambia entre el ícono de hamburguesa y el de 'X'
    openIcon.classList.toggle('hidden');
    closeIcon.classList.toggle('hidden');

    // Actualiza el atributo ARIA para accesibilidad
    const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
});

  
  // Navigation
  document.addEventListener('click', function(e) {
    const navLink = e.target.closest('.nav-link');
    if (navLink) {
      e.preventDefault();
      const section = navLink.getAttribute('data-section');
      showSection(section);
    }
  });
  
  // Button event listeners
  document.getElementById('add-product-btn')?.addEventListener('click', showAddProductModal);
  document.getElementById('product-modal-close')?.addEventListener('click', hideProductModal);
  document.getElementById('product-modal-cancel')?.addEventListener('click', hideProductModal);
  document.getElementById('product-modal-save')?.addEventListener('click', saveProduct);
  
  document.getElementById('new-invoice-btn')?.addEventListener('click', startNewInvoice);
  document.getElementById('complete-sale-btn')?.addEventListener('click', completeSale);
  
  document.getElementById('prev-page')?.addEventListener('click', prevPage);
  document.getElementById('next-page')?.addEventListener('click', nextPage);
  
  document.getElementById('save-company-info')?.addEventListener('click', saveCompanyInfo);
  document.getElementById('save-tax-settings')?.addEventListener('click', saveTaxSettings);
  document.getElementById('export-data')?.addEventListener('click', exportData);
  document.getElementById('import-data')?.addEventListener('click', () => document.getElementById('import-file').click());
  document.getElementById('import-file')?.addEventListener('change', importData);
  document.getElementById('clear-data')?.addEventListener('click', clearAllData);
  
  // Modal close handlers
  document.getElementById('invoice-view-modal-close')?.addEventListener('click', () => {
    document.getElementById('invoice-view-modal').classList.remove('active');
  });
  document.getElementById('invoice-view-close')?.addEventListener('click', () => {
    document.getElementById('invoice-view-modal').classList.remove('active');
  });
  document.getElementById('invoice-print-btn')?.addEventListener('click', () => {
    window.print();
  });
  
  // Search and filter events
  document.getElementById('product-search')?.addEventListener('input', displayProducts);
  document.getElementById('category-filter')?.addEventListener('change', displayProducts);
  document.getElementById('sales-product-search')?.addEventListener('input', displayProductsForSale);
  document.getElementById('payment-amount')?.addEventListener('input', calculateChange);
  document.getElementById('invoice-search')?.addEventListener('input', displayInvoiceHistory);
  document.getElementById('date-filter')?.addEventListener('change', displayInvoiceHistory);
  
  // Enter key handling for sales product search
  document.getElementById('sales-product-search')?.addEventListener('keypress', async function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const searchTerm = this.value.toLowerCase();
      if (searchTerm) {
        const products = await db.products.where('stock').above(0).filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.code.toLowerCase().includes(searchTerm)
        ).toArray();
        
        if (products.length === 1) {
          await addToInvoice(products[0].id);
          this.value = '';
        }
      }
    }
  });
  
  // Close modals on backdrop click
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('active');
    }
  });
  
  // Initial load
  showSection('dashboard');
});

// Make functions globally available for onclick handlers
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.addToInvoice = addToInvoice;
window.removeFromInvoice = removeFromInvoice;
window.changeQuantity = changeQuantity;
window.viewInvoice = viewInvoice;
window.editInvoiceFromHistory = editInvoiceFromHistory;
window.deleteInvoice = deleteInvoice;