// Simple API for Tzolent Management System
// This is a client-side API that uses localStorage for data persistence

class TzolentAPI {
    constructor() {
        this.baseUrl = window.location.origin;
        this.storageKey = 'tzolent_data';
    }

    // Initialize API with default data
    init() {
        if (!this.getData()) {
            this.setDefaultData();
        }
    }

    // Get all data
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    // Save all data
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Get menu data
    getMenu() {
        const data = this.getData();
        return data ? data.menu : null;
    }

    // Save menu data
    saveMenu(menuData) {
        const data = this.getData() || {};
        data.menu = menuData;
        return this.saveData(data);
    }

    // Get settings
    getSettings() {
        const data = this.getData();
        return data ? data.settings : null;
    }

    // Save settings
    saveSettings(settings) {
        const data = this.getData() || {};
        data.settings = settings;
        return this.saveData(data);
    }

    // Get orders
    getOrders() {
        const data = this.getData();
        return data ? data.orders || [] : [];
    }

    // Add order
    addOrder(order) {
        const data = this.getData() || {};
        if (!data.orders) data.orders = [];
        
        order.id = Date.now();
        order.timestamp = new Date().toISOString();
        order.status = 'pending';
        
        data.orders.push(order);
        return this.saveData(data);
    }

    // Update order status
    updateOrderStatus(orderId, status) {
        const data = this.getData();
        if (!data || !data.orders) return false;
        
        const order = data.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            order.updatedAt = new Date().toISOString();
            return this.saveData(data);
        }
        return false;
    }

    // Delete order
    deleteOrder(orderId) {
        const data = this.getData();
        if (!data || !data.orders) return false;
        
        data.orders = data.orders.filter(o => o.id !== orderId);
        return this.saveData(data);
    }

    // Set default data
    setDefaultData() {
        const defaultData = {
            menu: {
                main: [
                {
                    id: 1,
                    name: "סטייק אנטריקוט",
                    description: "סטייק אנטריקוט מעולה עם תבלינים מיוחדים, מוגש עם ירקות צלויים",
                    price: 89,
                    category: "main",
                    icon: "🥩",
                    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop",
                    outOfStock: false
                },
                    {
                        id: 2,
                        name: "דג סלמון בגריל",
                        description: "דג סלמון טרי בגריל עם עשבי תיבול, מוגש עם אורז וריזוטו",
                        price: 75,
                        category: "main",
                        icon: "🐟",
                        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop",
                        outOfStock: false
                    },
                    {
                        id: 3,
                        name: "פסטה קרבונרה",
                        description: "פסטה קרבונרה קלאסית עם פנצ'טה, גבינת פרמזן וביצה",
                        price: 65,
                        category: "main",
                        icon: "🍝",
                        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop",
                        outOfStock: false
                    },
                    {
                        id: 4,
                        name: "עוף צלוי",
                        description: "עוף שלם צלוי בתנור עם תבלינים, מוגש עם תפוחי אדמה",
                        price: 68,
                        category: "main",
                        icon: "🍗",
                        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop",
                        outOfStock: false
                    }
                ],
                sides: [
                    {
                        id: 5,
                        name: "סלט ירקות טריים",
                        description: "סלט ירקות עונתיים עם רוטב ויניגרט מיוחד",
                        price: 25,
                        category: "sides",
                        icon: "🥗",
                        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop",
                        outOfStock: false
                    },
                    {
                        id: 6,
                        name: "תפוחי אדמה צלויים",
                        description: "תפוחי אדמה צלויים עם עשבי תיבול וגבינה",
                        price: 22,
                        category: "sides",
                        icon: "🥔",
                        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&h=200&fit=crop",
                        outOfStock: false
                    },
                    {
                        id: 7,
                        name: "לחם שום",
                        description: "לחם שום חם וטרי מהתנור",
                        price: 18,
                        category: "sides",
                        icon: "🍞",
                        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop",
                        outOfStock: false
                    }
                ],
                desserts: [
                    {
                        id: 8,
                        name: "טירמיסו",
                        description: "טירמיסו קלאסי עם קפה ומסקרפונה",
                        price: 35,
                        category: "desserts",
                        icon: "🍰",
                        image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop",
                        outOfStock: false
                    },
                    {
                        id: 9,
                        name: "שוקולד מוס",
                        description: "מוס שוקולד עשיר עם פירות יער טריים",
                        price: 32,
                        category: "desserts",
                        icon: "🍫",
                        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop",
                        outOfStock: false
                    },
                    {
                        id: 10,
                        name: "קרם ברולה",
                        description: "קרם ברולה קלאסי עם קרמל קריספי",
                        price: 30,
                        category: "desserts",
                        icon: "🥧",
                        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop",
                        outOfStock: false
                    }
                ],
                drinks: [
                    {
                        id: 11,
                        name: "יין אדום",
                        description: "יין אדום איכותי מהכרמים המקומיים",
                        price: 45,
                        category: "drinks",
                        icon: "🍷",
                        image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop",
                        outOfStock: false
                    },
                    {
                        id: 12,
                        name: "בירה מקומית",
                        description: "בירה מקומית טרייה וקרה",
                        price: 28,
                        category: "drinks",
                        icon: "🍺",
                        image: "https://images.unsplash.com/photo-1608270586208-4542d528a7a4?w=300&h=200&fit=crop",
                        outOfStock: false
                    },
                    {
                        id: 13,
                        name: "לימונדה טבעית",
                        description: "לימונדה טבעית עם נענע ולימון טרי",
                        price: 18,
                        category: "drinks",
                        icon: "🍋",
                        image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=200&fit=crop",
                        outOfStock: false
                    }
                ]
            },
            settings: {
                name: "צולנט במדבר",
                phone: "050-123-4567",
                address: "רחוב הדוגמאות 123, תל אביב",
                email: "info@tzolent.co.il"
            },
            orders: []
        };

        this.saveData(defaultData);
    }

    // Export data (for backup)
    exportData() {
        const data = this.getData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tzolent-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Import data (for restore)
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (this.saveData(data)) {
                        resolve('Data imported successfully');
                    } else {
                        reject('Failed to save imported data');
                    }
                } catch (error) {
                    reject('Invalid file format');
                }
            };
            reader.onerror = () => reject('Failed to read file');
            reader.readAsText(file);
        });
    }

    // Clear all data
    clearData() {
        localStorage.removeItem(this.storageKey);
    }

    // Get statistics
    getStats() {
        const data = this.getData();
        if (!data) return null;

        const stats = {
            totalMenuItems: 0,
            totalOrders: data.orders ? data.orders.length : 0,
            pendingOrders: 0,
            completedOrders: 0,
            totalRevenue: 0
        };

        // Count menu items
        if (data.menu) {
            Object.values(data.menu).forEach(category => {
                stats.totalMenuItems += category.length;
            });
        }

        // Count orders and revenue
        if (data.orders) {
            data.orders.forEach(order => {
                if (order.status === 'pending') stats.pendingOrders++;
                if (order.status === 'completed') stats.completedOrders++;
                if (order.total) stats.totalRevenue += order.total;
            });
        }

        return stats;
    }
}

// Create global API instance
window.tzolentAPI = new TzolentAPI();

// Initialize API when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.tzolentAPI.init();
});
