/**
 * Main Application Entry Point
 * Orchestrates component initialization and app lifecycle
 * Implements Open/Closed Principle - Open for extension, closed for modification
 */
class Application {
    constructor() {
        this.version = '1.0.0';
        this.isInitialized = false;
        this.components = [];
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) {
            console.warn('Application already initialized');
            return;
        }

        try {
            console.log(`🚀 Initializing Amal Platform v${this.version}`);

            // Setup error handling
            this.setupErrorHandling();

            // Setup global event listeners
            this.setupGlobalEvents();

            // Register application-wide listeners
            this.registerEventListeners();

            // Mark as initialized
            this.isInitialized = true;

            // Emit ready event
            window.eventBus.emit('app:ready', { version: this.version });

            console.log('✅ Application initialized successfully');

        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.logError(event.error);
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.logError(event.reason);
        });
    }

    /**
     * Setup global events
     */
    setupGlobalEvents() {
        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                window.eventBus.emit('app:hidden', {});
            } else {
                window.eventBus.emit('app:visible', {});
            }
        });

        // Online/Offline detection
        window.addEventListener('online', () => {
            window.eventBus.emit('app:online', {});
            this.showNotification('اتصال الإنترنت متاح', 'success');
        });

        window.addEventListener('offline', () => {
            window.eventBus.emit('app:offline', {});
            this.showNotification('انقطع اتصال الإنترنت', 'warning');
        });

        // Window resize with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                window.eventBus.emit('app:resize', {
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            }, 250);
        });
    }

    /**
     * Register application-wide event listeners
     */
    registerEventListeners() {
        // CTA clicks
        window.eventBus.on('cta:clicked', (data) => {
            console.log('CTA clicked:', data);
            // Could track in analytics
        });

        // Journey start
        window.eventBus.on('journey:start', (data) => {
            console.log('Journey started:', data);
            // Initialize chat, track event, etc.
        });

        // Navigation changes
        window.eventBus.on('navigation:change', (data) => {
            console.log('Navigation changed:', data);
            // Update URL, track page view, etc.
        });

        // State changes
        window.eventBus.on('state:user.language', ({ value }) => {
            console.log('Language changed to:', value);
            this.handleLanguageChange(value);
        });
    }

    /**
     * Handle language change
     * @param {string} language - New language code
     */
    handleLanguageChange(language) {
        // Update document direction
        document.documentElement.setAttribute('lang', language);
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');

        // Emit event for other components to react
        window.eventBus.emit('language:changed', { language });
    }

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     */
    showNotification(message, type = 'info') {
        // This is a simple implementation - could be replaced with a toast library
        console.log(`[${type.toUpperCase()}] ${message}`);

        // In production, this would show a toast notification
        window.eventBus.emit('notification:show', { message, type });
    }

    /**
     * Log error for monitoring
     * @param {Error} error - Error object
     */
    logError(error) {
        // In production, this would send to error tracking service
        // (e.g., Sentry, Rollbar, etc.)
        const errorData = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        console.error('Logged error:', errorData);
        window.eventBus.emit('error:logged', errorData);
    }

    /**
     * Handle initialization errors
     * @param {Error} error - Initialization error
     */
    handleInitializationError(error) {
        // Show user-friendly error message
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #DC2626;
            color: white;
            padding: 2rem;
            border-radius: 0.5rem;
            text-align: center;
            z-index: 9999;
        `;
        errorContainer.innerHTML = `
            <h2 style="margin-bottom: 1rem;">حدث خطأ في تحميل التطبيق</h2>
            <p>نعتذر عن الإزعاج. يرجى تحديث الصفحة.</p>
            <button onclick="window.location.reload()" style="
                margin-top: 1rem;
                padding: 0.5rem 1rem;
                background: white;
                color: #DC2626;
                border: none;
                border-radius: 0.25rem;
                cursor: pointer;
                font-weight: bold;
            ">تحديث الصفحة</button>
        `;
        document.body.appendChild(errorContainer);
    }

    /**
     * Destroy application and cleanup
     */
    destroy() {
        // Clear all event listeners
        window.eventBus.clear();

        // Reset state
        window.stateManager.reset();

        // Mark as not initialized
        this.isInitialized = false;

        console.log('Application destroyed');
    }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new Application();
        app.init();

        // Make app instance globally available for debugging
        window.app = app;
    });
} else {
    const app = new Application();
    app.init();
    window.app = app;
}
