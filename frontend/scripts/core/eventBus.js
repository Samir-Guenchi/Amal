/**
 * Event Bus - Pub/Sub Pattern for Decoupled Communication
 * Implements Observer Pattern (SOLID: Dependency Inversion Principle)
 */
class EventBus {
    constructor() {
        this.events = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Callback function to execute
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        
        this.events.get(eventName).push(callback);
        
        // Return unsubscribe function
        return () => this.off(eventName, callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Callback function to remove
     */
    off(eventName, callback) {
        if (!this.events.has(eventName)) return;
        
        const callbacks = this.events.get(eventName);
        const index = callbacks.indexOf(callback);
        
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Emit an event
     * @param {string} eventName - Name of the event
     * @param {*} data - Data to pass to callbacks
     */
    emit(eventName, data) {
        if (!this.events.has(eventName)) return;
        
        this.events.get(eventName).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event handler for ${eventName}:`, error);
            }
        });
    }

    /**
     * Subscribe to an event once
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Callback function to execute once
     */
    once(eventName, callback) {
        const onceWrapper = (data) => {
            callback(data);
            this.off(eventName, onceWrapper);
        };
        
        this.on(eventName, onceWrapper);
    }

    /**
     * Clear all event listeners for a specific event
     * @param {string} eventName - Name of the event
     */
    clear(eventName) {
        if (eventName) {
            this.events.delete(eventName);
        } else {
            this.events.clear();
        }
    }
}

// Export singleton instance
window.eventBus = new EventBus();
