/**
 * State Manager - Centralized State Management
 * Implements Single Responsibility Principle
 */
class StateManager {
    constructor() {
        this.state = {
            user: {
                isAuthenticated: false,
                language: 'ar',
                preferences: {}
            },
            ui: {
                currentPage: 'home',
                isNavbarScrolled: false,
                isMobileMenuOpen: false
            },
            chat: {
                messages: [],
                isTyping: false
            }
        };

        this.listeners = new Map();
    }

    /**
     * Get current state
     * @param {string} path - Dot notation path to state (e.g., 'user.language')
     * @returns {*} State value
     */
    get(path) {
        if (!path) return this.state;

        return path.split('.').reduce((obj, key) => {
            return obj && obj[key] !== undefined ? obj[key] : undefined;
        }, this.state);
    }

    /**
     * Set state value and notify listeners
     * @param {string} path - Dot notation path to state
     * @param {*} value - Value to set
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();

        // Navigate to the parent object
        const parent = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.state);

        // Set the value
        const oldValue = parent[lastKey];
        parent[lastKey] = value;

        // Notify listeners
        this.notifyListeners(path, value, oldValue);

        // Emit event through event bus
        window.eventBus.emit(`state:${path}`, { value, oldValue });
    }

    /**
     * Update state by merging with existing value
     * @param {string} path - Dot notation path to state
     * @param {Object} updates - Object with updates to merge
     */
    update(path, updates) {
        const current = this.get(path);

        if (typeof current === 'object' && !Array.isArray(current)) {
            this.set(path, { ...current, ...updates });
        } else {
            console.warn(`Cannot update non-object state at path: ${path}`);
        }
    }

    /**
     * Subscribe to state changes
     * @param {string} path - Dot notation path to state
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }

        this.listeners.get(path).push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(path);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    /**
     * Notify all listeners for a specific path
     * @param {string} path - State path
     * @param {*} value - New value
     * @param {*} oldValue - Old value
     */
    notifyListeners(path, value, oldValue) {
        if (!this.listeners.has(path)) return;

        this.listeners.get(path).forEach(callback => {
            try {
                callback(value, oldValue);
            } catch (error) {
                console.error(`Error in state listener for ${path}:`, error);
            }
        });
    }

    /**
     * Reset state to initial values
     */
    reset() {
        this.state = {
            user: {
                isAuthenticated: false,
                language: 'ar',
                preferences: {}
            },
            ui: {
                currentPage: 'home',
                isNavbarScrolled: false,
                isMobileMenuOpen: false
            },
            chat: {
                messages: [],
                isTyping: false
            }
        };

        window.eventBus.emit('state:reset', {});
    }

    /**
     * Persist state to localStorage
     */
    persist() {
        try {
            localStorage.setItem('appState', JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to persist state:', error);
        }
    }

    /**
     * Restore state from localStorage
     */
    restore() {
        try {
            const savedState = localStorage.getItem('appState');
            if (savedState) {
                this.state = { ...this.state, ...JSON.parse(savedState) };
                window.eventBus.emit('state:restored', this.state);
            }
        } catch (error) {
            console.error('Failed to restore state:', error);
        }
    }
}

// Export singleton instance
window.stateManager = new StateManager();

// Auto-persist state on changes
window.addEventListener('beforeunload', () => {
    window.stateManager.persist();
});

// Restore state on load
window.addEventListener('DOMContentLoaded', () => {
    window.stateManager.restore();
});
