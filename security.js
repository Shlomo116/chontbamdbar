// Security and Encryption for Tzolent Management System

class TzolentSecurity {
    constructor() {
        this.encryptionKey = this.generateKey();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.maxLoginAttempts = 5;
        this.lockoutTime = 15 * 60 * 1000; // 15 minutes
    }

    // Generate encryption key
    generateKey() {
        const key = 'tzolent_secure_key_2024';
        return btoa(key).substring(0, 32);
    }

    // Simple encryption (for demo purposes - in production use proper encryption)
    encrypt(text) {
        try {
            const key = this.encryptionKey;
            let encrypted = '';
            for (let i = 0; i < text.length; i++) {
                encrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return btoa(encrypted);
        } catch (error) {
            console.error('Encryption error:', error);
            return text;
        }
    }

    // Simple decryption
    decrypt(encryptedText) {
        try {
            const key = this.encryptionKey;
            const text = atob(encryptedText);
            let decrypted = '';
            for (let i = 0; i < text.length; i++) {
                decrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            return encryptedText;
        }
    }

    // Hash password (simple hash for demo)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Verify password
    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    // Check if user is locked out
    isLockedOut() {
        const lockoutData = localStorage.getItem('tzolent_lockout');
        if (!lockoutData) return false;

        const { attempts, lockoutTime } = JSON.parse(lockoutData);
        const now = Date.now();

        if (now < lockoutTime) {
            const remainingTime = Math.ceil((lockoutTime - now) / 1000 / 60);
            return { locked: true, remainingTime };
        }

        // Lockout expired, reset attempts
        localStorage.removeItem('tzolent_lockout');
        return false;
    }

    // Record failed login attempt
    recordFailedAttempt() {
        const lockoutData = localStorage.getItem('tzolent_lockout');
        let attempts = 1;
        let lockoutTime = null;

        if (lockoutData) {
            const data = JSON.parse(lockoutData);
            attempts = data.attempts + 1;
            lockoutTime = data.lockoutTime;
        }

        if (attempts >= this.maxLoginAttempts) {
            lockoutTime = Date.now() + this.lockoutTime;
        }

        localStorage.setItem('tzolent_lockout', JSON.stringify({
            attempts,
            lockoutTime
        }));

        return { attempts, locked: attempts >= this.maxLoginAttempts };
    }

    // Clear failed attempts
    clearFailedAttempts() {
        localStorage.removeItem('tzolent_lockout');
    }

    // Create secure session
    createSession() {
        const sessionData = {
            timestamp: Date.now(),
            token: this.generateSessionToken()
        };
        
        const encryptedSession = this.encrypt(JSON.stringify(sessionData));
        localStorage.setItem('tzolent_session', encryptedSession);
        
        return sessionData.token;
    }

    // Generate session token
    generateSessionToken() {
        return 'tzolent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Verify session
    verifySession() {
        const encryptedSession = localStorage.getItem('tzolent_session');
        if (!encryptedSession) return false;

        try {
            const sessionData = JSON.parse(this.decrypt(encryptedSession));
            const now = Date.now();
            
            // Check if session is expired
            if (now - sessionData.timestamp > this.sessionTimeout) {
                this.destroySession();
                return false;
            }

            return true;
        } catch (error) {
            this.destroySession();
            return false;
        }
    }

    // Destroy session
    destroySession() {
        localStorage.removeItem('tzolent_session');
    }

    // Secure data storage
    secureStore(key, data) {
        try {
            const encryptedData = this.encrypt(JSON.stringify(data));
            localStorage.setItem(`tzolent_secure_${key}`, encryptedData);
            return true;
        } catch (error) {
            console.error('Secure storage error:', error);
            return false;
        }
    }

    // Secure data retrieval
    secureRetrieve(key) {
        try {
            const encryptedData = localStorage.getItem(`tzolent_secure_${key}`);
            if (!encryptedData) return null;
            
            return JSON.parse(this.decrypt(encryptedData));
        } catch (error) {
            console.error('Secure retrieval error:', error);
            return null;
        }
    }

    // Input sanitization
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }

    // Validate email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone
    validatePhone(phone) {
        const phoneRegex = /^[\d\-\+\(\)\s]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    // Validate price
    validatePrice(price) {
        const numPrice = parseFloat(price);
        return !isNaN(numPrice) && numPrice >= 0 && numPrice <= 10000;
    }

    // Rate limiting
    rateLimit(action, maxAttempts = 10, timeWindow = 60000) {
        const key = `tzolent_rate_${action}`;
        const now = Date.now();
        const attempts = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Remove old attempts outside time window
        const validAttempts = attempts.filter(time => now - time < timeWindow);
        
        if (validAttempts.length >= maxAttempts) {
            return false;
        }
        
        validAttempts.push(now);
        localStorage.setItem(key, JSON.stringify(validAttempts));
        return true;
    }

    // Security headers simulation
    setSecurityHeaders() {
        // In a real application, these would be set by the server
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;";
        document.head.appendChild(meta);
    }

    // Audit log
    logSecurityEvent(event, details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            details,
            userAgent: navigator.userAgent,
            ip: 'client-side' // In real app, this would be server-side
        };

        const logs = JSON.parse(localStorage.getItem('tzolent_security_logs') || '[]');
        logs.push(logEntry);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('tzolent_security_logs', JSON.stringify(logs));
    }

    // Get security logs
    getSecurityLogs() {
        return JSON.parse(localStorage.getItem('tzolent_security_logs') || '[]');
    }

    // Clear security logs
    clearSecurityLogs() {
        localStorage.removeItem('tzolent_security_logs');
    }
}

// Create global security instance
window.tzolentSecurity = new TzolentSecurity();

// Initialize security when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.tzolentSecurity.setSecurityHeaders();
    window.tzolentSecurity.logSecurityEvent('page_load', { page: window.location.pathname });
});
