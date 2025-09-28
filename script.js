// Menu Data - will be loaded from API
let menuData = {};

// Cart Management
let cart = [];
let currentCategory = 'all';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadMenuFromAPI();
    setupEventListeners();
    updateCartDisplay();
    loadCartFromStorage();
    loadSettingsFromAPI();
    
    // Setup customer form
    document.getElementById('customerForm').addEventListener('submit', handleCustomerForm);
    
    // Add animations on page load
    addPageAnimations();
});

// Setup event listeners
function setupEventListeners() {
    // Category buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            filterMenuByCategory(category);
            
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Load menu from API
function loadMenuFromAPI() {
    if (window.tzolentAPI) {
        const apiMenuData = window.tzolentAPI.getMenu();
        if (apiMenuData) {
            menuData = apiMenuData;
        } else {
            // Fallback to default data if API not available
            loadDefaultMenuData();
        }
    } else {
        loadDefaultMenuData();
    }
    renderMenu();
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
                image: "🥩"
            },
            {
                id: 2,
                name: "דג סלמון בגריל",
                description: "דג סלמון טרי בגריל עם עשבי תיבול, מוגש עם אורז וריזוטו",
                price: 75,
                category: "main",
                image: "🐟"
            },
            {
                id: 3,
                name: "פסטה קרבונרה",
                description: "פסטה קרבונרה קלאסית עם פנצ'טה, גבינת פרמזן וביצה",
                price: 65,
                category: "main",
                image: "🍝"
            },
            {
                id: 4,
                name: "עוף צלוי",
                description: "עוף שלם צלוי בתנור עם תבלינים, מוגש עם תפוחי אדמה",
                price: 68,
                category: "main",
                image: "🍗"
            }
        ],
        sides: [
            {
                id: 5,
                name: "סלט ירקות טריים",
                description: "סלט ירקות עונתיים עם רוטב ויניגרט מיוחד",
                price: 25,
                category: "sides",
                image: "🥗"
            },
            {
                id: 6,
                name: "תפוחי אדמה צלויים",
                description: "תפוחי אדמה צלויים עם עשבי תיבול וגבינה",
                price: 22,
                category: "sides",
                image: "🥔"
            },
            {
                id: 7,
                name: "לחם שום",
                description: "לחם שום חם וטרי מהתנור",
                price: 18,
                category: "sides",
                image: "🍞"
            }
        ],
        desserts: [
            {
                id: 8,
                name: "טירמיסו",
                description: "טירמיסו קלאסי עם קפה ומסקרפונה",
                price: 35,
                category: "desserts",
                image: "🍰"
            },
            {
                id: 9,
                name: "שוקולד מוס",
                description: "מוס שוקולד עשיר עם פירות יער טריים",
                price: 32,
                category: "desserts",
                image: "🍫"
            },
            {
                id: 10,
                name: "קרם ברולה",
                description: "קרם ברולה קלאסי עם קרמל קריספי",
                price: 30,
                category: "desserts",
                image: "🥧"
            }
        ],
        drinks: [
            {
                id: 11,
                name: "יין אדום",
                description: "יין אדום איכותי מהכרמים המקומיים",
                price: 45,
                category: "drinks",
                image: "🍷"
            },
            {
                id: 12,
                name: "בירה מקומית",
                description: "בירה מקומית טרייה וקרה",
                price: 28,
                category: "drinks",
                image: "🍺"
            },
            {
                id: 13,
                name: "לימונדה טבעית",
                description: "לימונדה טבעית עם נענע ולימון טרי",
                price: 18,
                category: "drinks",
                image: "🍋"
            }
        ]
    };
}

// Load settings from API
function loadSettingsFromAPI() {
    if (window.tzolentAPI) {
        const settings = window.tzolentAPI.getSettings();
        if (settings) {
            updatePageSettings(settings);
        }
    }
}

// Get default image for category
function getDefaultImage(category) {
    const defaultImages = {
        'main': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop',
        'sides': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
        'desserts': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop',
        'drinks': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop'
    };
    return defaultImages[category] || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=200&fit=crop';
}

// Update page settings
function updatePageSettings(settings) {
    // Update restaurant name
    const logo = document.querySelector('.logo h1');
    if (logo && settings.name) {
        logo.textContent = settings.name;
    }
    
    // Update contact info
    const contactItems = document.querySelectorAll('.contact-item span');
    if (contactItems.length >= 3) {
        if (settings.phone) contactItems[0].textContent = settings.phone;
        if (settings.email) contactItems[1].textContent = settings.email;
        if (settings.address) contactItems[2].textContent = settings.address;
    }
    
    // Update about section
    const aboutTitle = document.querySelector('#about h2');
    if (aboutTitle && settings.name) {
        aboutTitle.textContent = `אודות ${settings.name}`;
    }
    
    const aboutText = document.querySelector('#about p');
    if (aboutText && settings.name) {
        aboutText.textContent = `${settings.name} מציעה לכם חוויה קולינרית ייחודית עם מנות אותנטיות ומגוונות. כל מנה מוכנה באהבה ובמקצועיות כדי להעניק לכם טעם בלתי נשכח.`;
    }
    
    // Update footer
    const footer = document.querySelector('.footer p');
    if (footer && settings.name) {
        footer.textContent = `© 2024 ${settings.name}. כל הזכויות שמורות.`;
    }
}

// Render menu items
function renderMenu() {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;
    
    const allItems = [];
    if (menuData.main) allItems.push(...menuData.main);
    if (menuData.sides) allItems.push(...menuData.sides);
    if (menuData.desserts) allItems.push(...menuData.desserts);
    if (menuData.drinks) allItems.push(...menuData.drinks);
    
    let itemsToShow = allItems;
    if (currentCategory !== 'all') {
        itemsToShow = allItems.filter(item => item.category === currentCategory);
    }
    
    menuGrid.innerHTML = itemsToShow.map(item => `
        <div class="menu-item" data-id="${item.id}">
            <div class="menu-item-image">
                <img src="${item.image || getDefaultImage(item.category)}" alt="${item.name}" onerror="this.src='${getDefaultImage(item.category)}'">
                ${item.outOfStock ? '<div class="out-of-stock-overlay">אזל מהמלאי</div>' : ''}
            </div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="menu-item-footer">
                <span class="menu-item-price">₪${item.price}</span>
                <button class="add-to-cart-btn" onclick="addToCart(${item.id})" ${item.outOfStock ? 'disabled' : ''}>
                    <i class="fas fa-plus"></i>
                    ${item.outOfStock ? 'אזל מהמלאי' : 'הוסף לעגלה'}
                </button>
            </div>
        </div>
    `).join('');
}

// Filter menu by category
function filterMenuByCategory(category) {
    currentCategory = category;
    renderMenu();
}

// Add item to cart
function addToCart(itemId) {
    const allItems = [...menuData.main, ...menuData.sides, ...menuData.desserts, ...menuData.drinks];
    const item = allItems.find(i => i.id === itemId);
    
    if (item) {
        if (item.outOfStock) {
            animateError(document.querySelector(`[data-id="${itemId}"]`));
            return;
        }
        
        const existingItem = cart.find(cartItem => cartItem.id === itemId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...item,
                quantity: 1
            });
        }
        updateCartDisplay();
        showAddToCartAnimation(itemId);
        animateCartButton();
    }
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay();
}

// Update item quantity in cart
function updateCartQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(itemId);
    } else {
        const item = cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            item.quantity = newQuantity;
        }
    }
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total;
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; color: rgba(255, 255, 255, 0.7); padding: 40px;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <p>העגלה ריקה</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>₪${item.price} × ${item.quantity}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    cartSidebar.classList.toggle('open');
    cartOverlay.classList.toggle('show');
}

// Close cart sidebar
function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('show');
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        alert('העגלה ריקה!');
        return;
    }
    
    // Open customer details modal
    openCustomerModal();
}

// Open customer modal
function openCustomerModal() {
    document.getElementById('customerModal').classList.add('show');
    document.getElementById('customerForm').reset();
}

// Close customer modal
function closeCustomerModal() {
    document.getElementById('customerModal').classList.remove('show');
}

// Handle customer form submission
function handleCustomerForm(e) {
    e.preventDefault();
    
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    // Validate inputs
    if (!customerName.trim()) {
        alert('אנא הכנס שם מלא');
        return;
    }
    
    if (!customerPhone.trim()) {
        alert('אנא הכנס מספר טלפון');
        return;
    }
    
    if (!paymentMethod) {
        alert('אנא בחר שיטת תשלום');
        return;
    }
    
    // Validate phone number
    if (window.tzolentSecurity && !window.tzolentSecurity.validatePhone(customerPhone)) {
        alert('מספר הטלפון לא תקין');
        return;
    }
    
    // Process order
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Save order to API
    if (window.tzolentAPI) {
        const order = {
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            customer: {
                name: customerName,
                phone: customerPhone,
                paymentMethod: paymentMethod
            },
            total: total,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        window.tzolentAPI.addOrder(order);
    }
    
    // Show success message
    const paymentMethodText = {
        'cash': 'מזומן',
        'paybox': 'PayBox'
    };
    
    alert(`ההזמנה התקבלה!\n\nשם: ${customerName}\nטלפון: ${customerPhone}\nתשלום: ${paymentMethodText[paymentMethod]}\nסה"כ: ₪${total}\n\nנחזור אליכם בקרוב!`);
    
    // Clear cart and close modals
    cart = [];
    updateCartDisplay();
    closeCart();
    closeCustomerModal();
}

// Scroll to menu function
function scrollToMenu() {
    document.getElementById('menu').scrollIntoView({
        behavior: 'smooth'
    });
}

// Show add to cart animation
function showAddToCartAnimation(itemId) {
    const menuItem = document.querySelector(`[data-id="${itemId}"]`);
    const button = menuItem.querySelector('.add-to-cart-btn');
    
    // Add animation class
    button.style.transform = 'scale(1.2)';
    button.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
    button.innerHTML = '<i class="fas fa-check"></i> נוסף!';
    animateAddToCart(button);
    
    setTimeout(() => {
        button.style.transform = 'scale(1)';
        button.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
        button.innerHTML = '<i class="fas fa-plus"></i> הוסף לעגלה';
    }, 1000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Close cart when clicking outside (but not on quantity buttons)
document.addEventListener('click', function(e) {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartButton = document.querySelector('.cart-button');
    
    // Don't close if clicking on quantity buttons or cart controls
    if (e.target.closest('.cart-item-controls') || 
        e.target.closest('.quantity-btn') ||
        e.target.closest('.cart-item')) {
        return;
    }
    
    if (cartSidebar.classList.contains('open') && 
        !cartSidebar.contains(e.target) && 
        !cartButton.contains(e.target)) {
        closeCart();
    }
});

// Add loading animation
function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>טוען...</p>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.querySelector('.loading-overlay');
    if (loader) {
        loader.remove();
    }
}

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // ESC key closes cart
    if (e.key === 'Escape') {
        closeCart();
    }
    
    // Enter key on category buttons
    if (e.key === 'Enter' && e.target.classList.contains('category-btn')) {
        e.target.click();
    }
});

// Add touch support for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    // Swipe up to close cart
    if (diff > swipeThreshold && document.getElementById('cartSidebar').classList.contains('open')) {
        closeCart();
    }
}

// Add cart persistence to localStorage
function saveCartToStorage() {
    localStorage.setItem('tzolent_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('tzolent_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

// Load cart on page load is handled in the main DOMContentLoaded event

// Save cart whenever it changes
const originalAddToCart = addToCart;
const originalRemoveFromCart = removeFromCart;
const originalUpdateCartQuantity = updateCartQuantity;

addToCart = function(itemId) {
    originalAddToCart(itemId);
    saveCartToStorage();
};

removeFromCart = function(itemId) {
    originalRemoveFromCart(itemId);
    saveCartToStorage();
};

updateCartQuantity = function(itemId, newQuantity) {
    originalUpdateCartQuantity(itemId, newQuantity);
    saveCartToStorage();
};

// Add page animations
function addPageAnimations() {
    // Animate menu items with stagger (only on load)
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

// Animate cart button
function animateCartButton() {
    const cartButton = document.querySelector('.cart-button');
    if (cartButton) {
        cartButton.classList.add('bounce');
        setTimeout(() => {
            cartButton.classList.remove('bounce');
        }, 1000);
    }
}

// Animate add to cart
function animateAddToCart(button) {
    button.classList.add('pulse');
    setTimeout(() => {
        button.classList.remove('pulse');
    }, 2000);
}

// Animate error
function animateError(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

// Add loading styles
const loadingStyles = `
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }
    
    .loading-spinner {
        text-align: center;
        color: white;
    }
    
    .loading-spinner i {
        font-size: 3rem;
        margin-bottom: 20px;
    }
    
    .loading-spinner p {
        font-size: 1.2rem;
        font-weight: 500;
    }
`;

// Add loading styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = loadingStyles;
document.head.appendChild(styleSheet);
