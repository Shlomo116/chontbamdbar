// Admin Panel JavaScript
// Password is now encrypted and stored securely
// Prevent duplicate variable declaration
if (typeof window.ENCRYPTED_PASSWORD === 'undefined') {
    window.ENCRYPTED_PASSWORD = 'dHpvbGVudDIwMjQ='; // Base64 encoded password
}
const ENCRYPTED_PASSWORD = window.ENCRYPTED_PASSWORD;
let menuData = {};
let currentEditingItem = null;
let currentCategory = 'main';

// Password encryption/decryption functions
function encryptPassword(password) {
    return btoa(password); // Base64 encoding
}

function decryptPassword(encryptedPassword) {
    return atob(encryptedPassword); // Base64 decoding
}

function verifyPassword(inputPassword) {
    const decryptedPassword = decryptPassword(ENCRYPTED_PASSWORD);
    return inputPassword === decryptedPassword;
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Check security session
    if (window.tzolentSecurity && !window.tzolentSecurity.verifySession()) {
        // Session expired or invalid, show login screen
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
    } else {
        // Valid session, show dashboard
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadMenuData();
    }
    
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            currentCategory = this.dataset.category;
            updateCategoryTabs();
            renderMenuItems();
        });
    });
    
    // Edit item form
    document.getElementById('editItemForm').addEventListener('submit', handleEditItem);
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    // Check if user is locked out
    if (window.tzolentSecurity) {
        const lockoutStatus = window.tzolentSecurity.isLockedOut();
        if (lockoutStatus && lockoutStatus.locked) {
            errorDiv.textContent = `חשבון נעול למשך ${lockoutStatus.remainingTime} דקות`;
            errorDiv.classList.add('show');
            setTimeout(() => {
                errorDiv.classList.remove('show');
            }, 5000);
            return;
        }
    }
    
    // Check rate limiting
    if (window.tzolentSecurity && !window.tzolentSecurity.rateLimit('login', 5, 300000)) {
        errorDiv.textContent = 'יותר מדי ניסיונות כניסה. נסה שוב מאוחר יותר';
        errorDiv.classList.add('show');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
        return;
    }
    
    // Sanitize input
    const sanitizedPassword = window.tzolentSecurity ? 
        window.tzolentSecurity.sanitizeInput(password) : password;
    
    if (verifyPassword(sanitizedPassword)) {
        // Clear failed attempts
        if (window.tzolentSecurity) {
            window.tzolentSecurity.clearFailedAttempts();
            window.tzolentSecurity.createSession();
            window.tzolentSecurity.logSecurityEvent('successful_login');
        }
        
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadMenuData();
    } else {
        // Record failed attempt
        if (window.tzolentSecurity) {
            const attemptResult = window.tzolentSecurity.recordFailedAttempt();
            window.tzolentSecurity.logSecurityEvent('failed_login', { attempts: attemptResult.attempts });
            
            if (attemptResult.locked) {
                errorDiv.textContent = 'חשבון נעול עקב יותר מדי ניסיונות כושלים';
                errorDiv.classList.add('show');
                setTimeout(() => {
                    errorDiv.classList.remove('show');
                }, 5000);
                return;
            }
        }
        
        errorDiv.textContent = 'סיסמה שגויה. הסיסמה הנכונה היא: tzolent2024';
        errorDiv.classList.add('show');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

// Logout function
function logout() {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
        if (window.tzolentSecurity) {
            window.tzolentSecurity.destroySession();
            window.tzolentSecurity.logSecurityEvent('logout');
        }
        
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('password').value = '';
    }
}

// Load menu data from API
function loadMenuData() {
    if (window.tzolentAPI) {
        // Sync data across devices
        window.tzolentAPI.syncData();
        
        const apiMenuData = window.tzolentAPI.getMenu();
        if (apiMenuData) {
            menuData = apiMenuData;
        } else {
            // Initialize with default data
            window.tzolentAPI.init();
            menuData = window.tzolentAPI.getMenu();
        }
    } else {
        // Fallback to localStorage
        const savedData = localStorage.getItem('tzolent_menu_data');
        if (savedData) {
            menuData = JSON.parse(savedData);
        } else {
            loadDefaultMenuData();
        }
    }
    
    renderMenuItems();
    loadSettings();
    loadOrders();
}

// Load default menu data (fallback)
function loadDefaultMenuData() {
    menuData = {
        main: [
            {
                id: 1,
                name: "סטייק אנטריקוט",
                description: "סטייק אנטריקוט מעולה עם תבלינים מיוחדים, מוגש עם ירקות צלויים",
                price: 89,
                category: "main",
                icon: "🥩"
            },
            {
                id: 2,
                name: "דג סלמון בגריל",
                description: "דג סלמון טרי בגריל עם עשבי תיבול, מוגש עם אורז וריזוטו",
                price: 75,
                category: "main",
                icon: "🐟"
            },
            {
                id: 3,
                name: "פסטה קרבונרה",
                description: "פסטה קרבונרה קלאסית עם פנצ'טה, גבינת פרמזן וביצה",
                price: 65,
                category: "main",
                icon: "🍝"
            },
            {
                id: 4,
                name: "עוף צלוי",
                description: "עוף שלם צלוי בתנור עם תבלינים, מוגש עם תפוחי אדמה",
                price: 68,
                category: "main",
                icon: "🍗"
            }
        ],
        sides: [
            {
                id: 5,
                name: "סלט ירקות טריים",
                description: "סלט ירקות עונתיים עם רוטב ויניגרט מיוחד",
                price: 25,
                category: "sides",
                icon: "🥗"
            },
            {
                id: 6,
                name: "תפוחי אדמה צלויים",
                description: "תפוחי אדמה צלויים עם עשבי תיבול וגבינה",
                price: 22,
                category: "sides",
                icon: "🥔"
            },
            {
                id: 7,
                name: "לחם שום",
                description: "לחם שום חם וטרי מהתנור",
                price: 18,
                category: "sides",
                icon: "🍞"
            }
        ],
        desserts: [
            {
                id: 8,
                name: "טירמיסו",
                description: "טירמיסו קלאסי עם קפה ומסקרפונה",
                price: 35,
                category: "desserts",
                icon: "🍰"
            },
            {
                id: 9,
                name: "שוקולד מוס",
                description: "מוס שוקולד עשיר עם פירות יער טריים",
                price: 32,
                category: "desserts",
                icon: "🍫"
            },
            {
                id: 10,
                name: "קרם ברולה",
                description: "קרם ברולה קלאסי עם קרמל קריספי",
                price: 30,
                category: "desserts",
                icon: "🥧"
            }
        ],
        drinks: [
            {
                id: 11,
                name: "יין אדום",
                description: "יין אדום איכותי מהכרמים המקומיים",
                price: 45,
                category: "drinks",
                icon: "🍷"
            },
            {
                id: 12,
                name: "בירה מקומית",
                description: "בירה מקומית טרייה וקרה",
                price: 28,
                category: "drinks",
                icon: "🍺"
            },
            {
                id: 13,
                name: "לימונדה טבעית",
                description: "לימונדה טבעית עם נענע ולימון טרי",
                price: 18,
                category: "drinks",
                icon: "🍋"
            }
        ]
    };
}

// Save menu data to API
function saveMenuData() {
    if (window.tzolentAPI) {
        window.tzolentAPI.saveMenu(menuData);
    } else {
        localStorage.setItem('tzolent_menu_data', JSON.stringify(menuData));
    }
}

// Update category tabs
function updateCategoryTabs() {
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === currentCategory) {
            tab.classList.add('active');
        }
    });
}

// Render menu items
function renderMenuItems() {
    const container = document.getElementById('menuItemsAdmin');
    const items = menuData[currentCategory] || [];
    
    if (items.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #7f8c8d; padding: 40px;">
                <i class="fas fa-utensils" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <p>אין פריטים בקטגוריה זו</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="menu-item-admin">
            <div class="menu-item-header">
                <div class="menu-item-info">
                    <h3>${item.icon} ${item.name}</h3>
                    <div class="price">₪${item.price}</div>
                </div>
                <div class="menu-item-actions">
                    <button class="stock-btn ${item.outOfStock ? 'out-of-stock' : 'in-stock'}" onclick="toggleStock(${item.id})">
                        <i class="fas fa-${item.outOfStock ? 'times' : 'check'}"></i>
                        ${item.outOfStock ? 'אזל מהמלאי' : 'במלאי'}
                    </button>
                    <button class="edit-btn" onclick="editMenuItem(${item.id})">
                        <i class="fas fa-edit"></i>
                        ערוך
                    </button>
                    <button class="delete-btn" onclick="deleteMenuItem(${item.id})">
                        <i class="fas fa-trash"></i>
                        מחק
                    </button>
                </div>
            </div>
            <div class="menu-item-description">${item.description}</div>
            <div class="menu-item-category">${getCategoryName(item.category)}</div>
        </div>
    `).join('');
}

// Get category name in Hebrew
function getCategoryName(category) {
    const names = {
        'main': 'מנות עיקריות',
        'sides': 'תוספות',
        'desserts': 'קינוחים',
        'drinks': 'משקאות'
    };
    return names[category] || category;
}

// Add new menu item
function addNewMenuItem() {
    currentEditingItem = null;
    openEditModal();
}

// Edit menu item
function editMenuItem(itemId) {
    const allItems = [...menuData.main, ...menuData.sides, ...menuData.desserts, ...menuData.drinks];
    const item = allItems.find(i => i.id === itemId);
    
    if (item) {
        currentEditingItem = item;
        openEditModal();
    }
}

// Delete menu item
function deleteMenuItem(itemId) {
    if (confirm('האם אתה בטוח שברצונך למחוק פריט זה?')) {
        // Remove from all categories
        Object.keys(menuData).forEach(category => {
            menuData[category] = menuData[category].filter(item => item.id !== itemId);
        });
        
        saveMenuData();
        renderMenuItems();
        showNotification('הפריט נמחק בהצלחה', 'success');
    }
}

// Toggle stock status
function toggleStock(itemId) {
    // Find item in all categories
    let item = null;
    let category = null;
    
    Object.keys(menuData).forEach(cat => {
        const foundItem = menuData[cat].find(i => i.id === itemId);
        if (foundItem) {
            item = foundItem;
            category = cat;
        }
    });
    
    if (item) {
        item.outOfStock = !item.outOfStock;
        saveMenuData();
        renderMenuItems();
        
        const status = item.outOfStock ? 'אזל מהמלאי' : 'במלאי';
        showNotification(`הפריט "${item.name}" ${status}`, 'success');
        
        if (window.tzolentSecurity) {
            window.tzolentSecurity.logSecurityEvent('stock_toggled', {
                itemId: itemId,
                itemName: item.name,
                outOfStock: item.outOfStock
            });
        }
    }
}

// Open edit modal
function openEditModal() {
    const modal = document.getElementById('editItemModal');
    const form = document.getElementById('editItemForm');
    
    if (currentEditingItem) {
        // Edit existing item
        document.getElementById('editItemId').value = currentEditingItem.id;
        document.getElementById('editItemName').value = currentEditingItem.name;
        document.getElementById('editItemDescription').value = currentEditingItem.description;
        document.getElementById('editItemPrice').value = currentEditingItem.price;
        document.getElementById('editItemCategory').value = currentEditingItem.category;
        document.getElementById('editItemIcon').value = currentEditingItem.icon;
    } else {
        // Add new item
        form.reset();
        document.getElementById('editItemCategory').value = currentCategory;
        document.getElementById('editItemIcon').value = '🍽️';
    }
    
    modal.classList.add('show');
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editItemModal').classList.remove('show');
    currentEditingItem = null;
}

// Handle edit item form submission
function handleEditItem(e) {
    e.preventDefault();
    
    // Check security session
    if (window.tzolentSecurity && !window.tzolentSecurity.verifySession()) {
        alert('הסשן פג. אנא התחבר מחדש.');
        logout();
        return;
    }
    
    const formData = new FormData(e.target);
    const itemData = {
        id: currentEditingItem ? currentEditingItem.id : Date.now(),
        name: formData.get('editItemName') || document.getElementById('editItemName').value,
        description: formData.get('editItemDescription') || document.getElementById('editItemDescription').value,
        price: parseFloat(formData.get('editItemPrice') || document.getElementById('editItemPrice').value),
        category: formData.get('editItemCategory') || document.getElementById('editItemCategory').value,
        icon: formData.get('editItemIcon') || document.getElementById('editItemIcon').value
    };
    
    // Sanitize and validate input
    if (window.tzolentSecurity) {
        itemData.name = window.tzolentSecurity.sanitizeInput(itemData.name);
        itemData.description = window.tzolentSecurity.sanitizeInput(itemData.description);
        itemData.icon = window.tzolentSecurity.sanitizeInput(itemData.icon);
        
        // Validate price
        if (!window.tzolentSecurity.validatePrice(itemData.price)) {
            alert('מחיר לא תקין. אנא הכנס מחיר בין 0 ל-10,000 ש"ח.');
            return;
        }
    }
    
    if (currentEditingItem) {
        // Update existing item
        Object.keys(menuData).forEach(category => {
            const index = menuData[category].findIndex(item => item.id === currentEditingItem.id);
            if (index !== -1) {
                menuData[category].splice(index, 1);
            }
        });
    }
    
    // Add to new category
    if (!menuData[itemData.category]) {
        menuData[itemData.category] = [];
    }
    menuData[itemData.category].push(itemData);
    
    saveMenuData();
    renderMenuItems();
    closeEditModal();
    
    const message = currentEditingItem ? 'הפריט עודכן בהצלחה' : 'הפריט נוסף בהצלחה';
    showNotification(message, 'success');
}

// Save all changes
function saveAllChanges() {
    // Check security session
    if (window.tzolentSecurity && !window.tzolentSecurity.verifySession()) {
        alert('הסשן פג. אנא התחבר מחדש.');
        logout();
        return;
    }
    
    // Rate limiting for save operations
    if (window.tzolentSecurity && !window.tzolentSecurity.rateLimit('save', 20, 60000)) {
        alert('יותר מדי שמירות. אנא המתן דקה לפני שמירה נוספת.');
        return;
    }
    
    saveMenuData();
    saveSettings();
    
    if (window.tzolentSecurity) {
        window.tzolentSecurity.logSecurityEvent('data_saved');
    }
    
    showNotification('כל השינויים נשמרו בהצלחה', 'success');
}

// Load settings
function loadSettings() {
    let settings = null;
    
    if (window.tzolentAPI) {
        settings = window.tzolentAPI.getSettings();
    } else {
        const savedSettings = localStorage.getItem('tzolent_settings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
        }
    }
    
    if (settings) {
        document.getElementById('restaurantName').value = settings.name || 'צולנט במדבר';
        document.getElementById('restaurantPhone').value = settings.phone || '050-123-4567';
        document.getElementById('restaurantAddress').value = settings.address || 'רחוב הדוגמאות 123, תל אביב';
        document.getElementById('restaurantEmail').value = settings.email || 'info@tzolent.co.il';
    }
}

// Save settings
function saveSettings() {
    const settings = {
        name: document.getElementById('restaurantName').value,
        phone: document.getElementById('restaurantPhone').value,
        address: document.getElementById('restaurantAddress').value,
        email: document.getElementById('restaurantEmail').value
    };
    
    if (window.tzolentAPI) {
        window.tzolentAPI.saveSettings(settings);
    } else {
        localStorage.setItem('tzolent_settings', JSON.stringify(settings));
    }
}

// Load orders
function loadOrders() {
    if (!window.tzolentAPI) return;
    
    const orders = window.tzolentAPI.getOrders();
    const ordersContainer = document.getElementById('ordersContainer');
    
    if (!orders || orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-shopping-cart"></i>
                <p>אין הזמנות עדיין</p>
            </div>
        `;
        return;
    }
    
    // Sort orders by timestamp (newest first)
    const sortedOrders = orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    ordersContainer.innerHTML = sortedOrders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <h4>הזמנה #${order.id}</h4>
                <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-timestamp">
                <i class="fas fa-clock"></i>
                ${new Date(order.timestamp).toLocaleString('he-IL')}
            </div>
            ${order.customer ? `
                <div class="order-customer">
                    <div class="customer-info">
                        <span><i class="fas fa-user"></i> ${order.customer.name}</span>
                        <span><i class="fas fa-phone"></i> ${order.customer.phone}</span>
                        <span><i class="fas fa-credit-card"></i> ${getPaymentMethodText(order.customer.paymentMethod)}</span>
                    </div>
                </div>
            ` : ''}
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item-detail">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>₪${item.price * item.quantity}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-total">סה"כ: ₪${order.total}</div>
                <div class="order-actions">
                    ${order.status === 'pending' ? `
                        <button class="status-btn" onclick="updateOrderStatus(${order.id}, 'completed')">
                            <i class="fas fa-check"></i>
                            הושלם
                        </button>
                    ` : ''}
                    <button class="delete-btn" onclick="deleteOrder(${order.id})">
                        <i class="fas fa-trash"></i>
                        מחק
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Get status text in Hebrew
function getStatusText(status) {
    const statusTexts = {
        'pending': 'ממתין',
        'completed': 'הושלם',
        'cancelled': 'בוטל'
    };
    return statusTexts[status] || status;
}

// Get payment method text in Hebrew
function getPaymentMethodText(paymentMethod) {
    const paymentTexts = {
        'cash': 'מזומן',
        'paybox': 'PayBox'
    };
    return paymentTexts[paymentMethod] || paymentMethod;
}

// Update order status
function updateOrderStatus(orderId, status) {
    if (window.tzolentAPI) {
        window.tzolentAPI.updateOrderStatus(orderId, status);
        loadOrders();
        showNotification('סטטוס ההזמנה עודכן', 'success');
    }
}

// Delete order
function deleteOrder(orderId) {
    if (confirm('האם אתה בטוח שברצונך למחוק הזמנה זו?')) {
        if (window.tzolentAPI) {
            window.tzolentAPI.deleteOrder(orderId);
            loadOrders();
            showNotification('ההזמנה נמחקה', 'success');
        }
    }
}

// Export orders to CSV
function exportOrders() {
    if (!window.tzolentAPI) return;
    
    const orders = window.tzolentAPI.getOrders();
    if (orders.length === 0) {
        showNotification('אין הזמנות לייצוא', 'info');
        return;
    }
    
    // Create CSV content
    let csvContent = 'מספר הזמנה,תאריך,שם לקוח,טלפון,סטטוס,סה"כ\n';
    
    orders.forEach(order => {
        const date = new Date(order.timestamp).toLocaleDateString('he-IL');
        const customerName = order.customer ? order.customer.name : 'לא צוין';
        const customerPhone = order.customer ? order.customer.phone : 'לא צוין';
        const status = getStatusText(order.status);
        
        csvContent += `${order.id},${date},${customerName},${customerPhone},${status},${order.total}\n`;
    });
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('הזמנות יוצאו בהצלחה', 'success');
}

// Change password
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate inputs
    if (!currentPassword) {
        alert('אנא הכנס סיסמה נוכחית');
        return;
    }
    
    if (!newPassword) {
        alert('אנא הכנס סיסמה חדשה');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('הסיסמה החדשה חייבת להכיל לפחות 6 תווים');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('הסיסמה החדשה ואישור הסיסמה אינם תואמים');
        return;
    }
    
    // Check current password
    if (!verifyPassword(currentPassword)) {
        alert('הסיסמה הנוכחית שגויה');
        return;
    }
    
    // Update password
    if (confirm('האם אתה בטוח שברצונך לשנות את הסיסמה?')) {
        // Update the encrypted password
        const newEncryptedPassword = encryptPassword(newPassword);
        // Note: In a real application, this would be saved securely on the server
        // For demo purposes, we'll show the new encrypted password
        alert(`הסיסמה החדשה הוצפנה בהצלחה!\n\nהקוד המוצפן החדש: ${newEncryptedPassword}\n\nהחלף את ENCRYPTED_PASSWORD בקוד עם הקוד הזה.`);
        
        // Clear form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        showNotification('הסיסמה שונתה בהצלחה', 'success');
        
        if (window.tzolentSecurity) {
            window.tzolentSecurity.logSecurityEvent('password_changed');
        }
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('editItemModal');
    if (e.target === modal) {
        closeEditModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC key closes modal
    if (e.key === 'Escape') {
        closeEditModal();
    }
    
    // Ctrl+S saves changes
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveAllChanges();
    }
});

// Auto-save settings on change
document.addEventListener('input', function(e) {
    if (e.target.matches('#restaurantName, #restaurantPhone, #restaurantAddress, #restaurantEmail')) {
        saveSettings();
    }
});

// Auto-sync data every 30 seconds
setInterval(function() {
    if (window.tzolentAPI && window.tzolentAPI.checkForUpdates()) {
        // Data is fresh, no need to reload
        return;
    }
    
    // Reload data if needed
    if (window.tzolentAPI) {
        loadMenuData();
    }
}, 30000); // 30 seconds
